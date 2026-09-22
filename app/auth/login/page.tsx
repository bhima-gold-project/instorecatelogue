"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import {
  KeyRoundIcon,
  EyeIcon,
  EyeOffIcon,
  Smartphone,
  ShieldCheck,
  ArrowLeft,
  RotateCw,
  Clock,
  CheckCircle2,
  Lock
} from "lucide-react";

import ErrorMessage from "@/app/components/errormsg/page";
import {
  GetCartByUserId,
  NewStoreRegistration,
  VerifyBranchLogin,
  GenerateLoginOtp,
  VerifyLoginOtp,
  ResendLoginOtp,
  getAdminSettings
} from "@/app/function/action";
import { saveAuthSession, getLoginIdFromToken } from "@/app/function/authUtils";
import styles from "./login.module.css";

const LoginPage = () => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmailState] = useState("");
  const [password, setPasswordState] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Web OTP Config & Flow States
  const [isWebOtpEnabled, setIsWebOtpEnabled] = useState(false);
  const [checkingSettings, setCheckingSettings] = useState(true);
  const [loginStep, setLoginStep] = useState<"credentials" | "otp">("credentials");
  const [maskedPhone, setMaskedPhone] = useState<string | null>(null);

  // OTP Digit Inputs (4 Digits)
  const [otpDigits, setOtpDigits] = useState<string[]>(["", "", "", ""]);
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Resend Timer State
  const [resendTimer, setResendTimer] = useState<number>(0);
  const [isResending, setIsResending] = useState<boolean>(false);

  const router = useRouter();

  // --- Check existing token & admin settings on mount ---
  useEffect(() => {
    const token = Cookies.get("auth_token");
    if (token) {
      router.push("/");
      return;
    }

    const checkOtpConfig = async () => {
      try {
        const settings = await getAdminSettings();
        if (settings && typeof settings.isWebOtpLoginEnabled === "boolean") {
          setIsWebOtpEnabled(settings.isWebOtpLoginEnabled);
        }
      } catch (err) {
        console.error("Failed to check OTP login config:", err);
      } finally {
        setCheckingSettings(false);
      }
    };

    checkOtpConfig();
  }, [router]);

  // --- Resend Countdown Timer ---
  useEffect(() => {
    let interval: any;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  // --- Helper to handle successful authentication session ---
  const handleAuthSuccess = async (response: any) => {
    setErrorMessage("Login Successful");

    Cookies.remove("is_mobile", { path: "/" });
    if (response.token) {
      saveAuthSession(response.token, response);
    }

    const loginId = response.LoginID || (response.token ? getLoginIdFromToken() : null);
    if (loginId) {
      try {
        await GetCartByUserId(loginId);
      } catch (cErr) {
        console.error("Cart prefetch error:", cErr);
      }
    }

    toast.success("Login Successful. Welcome back!");

    setTimeout(() => {
      window.location.href = "/";
    }, 400);
  };

  // --- Standard / Step 1 Login Handler ---
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsButtonDisabled(true);
    setErrorMessage("");

    const cleanUsername = email.trim();
    const cleanPassword = password;

    if (!cleanUsername || !cleanPassword) {
      setErrorMessage("Please enter both username and password.");
      setIsButtonDisabled(false);
      return;
    }

    // CASE 1: If Web OTP Login is Enabled -> Generate OTP & Transition to Step 2
    if (isWebOtpEnabled) {
      try {
        const response = await GenerateLoginOtp(cleanUsername, cleanPassword);

        if (response && response.success) {
          setMaskedPhone(response.MobileNo || null);
          setLoginStep("otp");
          setOtpDigits(["", "", "", ""]);
          setResendTimer(60); // 60 seconds countdown
          setIsButtonDisabled(false);
          toast.success(
            response.MobileNo
              ? `OTP sent to ${response.MobileNo}`
              : "OTP sent to your registered mobile number."
          );

          // Focus the first OTP input box after render
          setTimeout(() => {
            otpInputRefs.current[0]?.focus();
          }, 150);
        } else {
          setErrorMessage(response?.message || "Invalid Username or Password");
          setIsButtonDisabled(false);
        }
      } catch (error: any) {
        console.error("OTP generation error:", error);
        setErrorMessage(error?.message || "Failed to send verification code. Please check connection.");
        setIsButtonDisabled(false);
      }
      return;
    }

    // CASE 2: Standard Direct Password Login (OTP Disabled)
    try {
      const response = await VerifyBranchLogin(cleanUsername, cleanPassword);

      if (response && response.message === "Login successful.") {
        await handleAuthSuccess(response);
      } else {
        setErrorMessage(response?.message || "Wrong Username or Password");
        setPasswordState("");
        setIsButtonDisabled(false);
      }
    } catch (error: any) {
      console.error("Login error:", error);
      setErrorMessage(error?.message || "Login failed. Please check connection.");
      setPasswordState("");
      setIsButtonDisabled(false);
    }
  };

  // --- Step 2: OTP Verification Handler ---
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpCode = otpDigits.join("").trim();

    if (otpCode.length < 4) {
      setErrorMessage("Please enter the complete 4-digit verification code.");
      return;
    }

    setIsButtonDisabled(true);
    setErrorMessage("");

    try {
      const response = await VerifyLoginOtp(email.trim(), otpCode);

      if (response && (response.success || response.token)) {
        await handleAuthSuccess(response);
      } else {
        setErrorMessage(response?.message || "Invalid or expired OTP. Please try again.");
        setIsButtonDisabled(false);
      }
    } catch (error: any) {
      console.error("OTP verification error:", error);
      setErrorMessage(error?.message || "Failed to verify OTP. Please try again.");
      setIsButtonDisabled(false);
    }
  };

  // --- Resend OTP Handler ---
  const handleResendOtp = async () => {
    if (resendTimer > 0 || isResending) return;

    setIsResending(true);
    setErrorMessage("");

    try {
      const response = await ResendLoginOtp(email.trim());
      if (response && response.success) {
        setResendTimer(60);
        setOtpDigits(["", "", "", ""]);
        toast.success("New verification code sent successfully.");
        otpInputRefs.current[0]?.focus();
      } else {
        toast.error(response?.message || "Failed to resend verification code.");
      }
    } catch (err: any) {
      console.error("Resend OTP error:", err);
      toast.error(err?.message || "Failed to resend verification code.");
    } finally {
      setIsResending(false);
    }
  };

  // --- OTP Digit Input Key Handler (Auto-focus & Paste support) ---
  const handleOtpDigitChange = (index: number, value: string) => {
    // Handle pasting multiple digits (e.g. "1234")
    if (value.length > 1) {
      const pasteDigits = value.replace(/\D/g, "").slice(0, 4).split("");
      const newDigits = [...otpDigits];
      pasteDigits.forEach((digit, i) => {
        if (index + i < 4) {
          newDigits[index + i] = digit;
        }
      });
      setOtpDigits(newDigits);
      const nextFocusIndex = Math.min(index + pasteDigits.length, 3);
      otpInputRefs.current[nextFocusIndex]?.focus();
      return;
    }

    // Only allow numeric input
    const cleanDigit = value.replace(/\D/g, "");
    const newDigits = [...otpDigits];
    newDigits[index] = cleanDigit;
    setOtpDigits(newDigits);

    // Auto move to next input
    if (cleanDigit && index < 3) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  // --- Store Registration Handler ---
  const handleRegistration = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data: any = Object.fromEntries(formData.entries());

    if (data.password !== data.confirm_password) {
      toast.error("Passwords do not match!");
      return;
    }
    if (!/^\d{10}$/.test(data.mobilenumber)) {
      toast.error("Mobile number must be 10 digits!");
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(data.email)) {
      toast.error("Invalid email format!");
      return;
    }

    setErrorMessage("");

    const regStatus = await NewStoreRegistration(data);

    if (regStatus.error) {
      toast.error(regStatus.error);
    }
    if (regStatus.message) {
      toast.success(regStatus.message);
      setIsRegistering(false);
    }
  };

  return (
    <div className={`${styles.loginPage} min-h-screen w-full flex flex-col lg:flex-row lg:grid-cols-[1.05fr_1fr] bg-[#FBF7F1]`}>
      <Toaster position="top-center" richColors duration={2000} />

      {/* ===== Left: brand panel ===== */}
      <div
        className="relative hidden lg:flex flex-col w-[50%] justify-between p-12 overflow-hidden text-[#F4EFE6] select-none"
        style={{
          background: "linear-gradient(160deg, #3C5448 0%, #2B3E34 100%)"
        }}
      >
        {/* Radial gradients overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `
                 radial-gradient(circle at 15% 15%, rgba(255,255,255,0.07), transparent 40%),
                 radial-gradient(circle at 85% 75%, rgba(255,255,255,0.06), transparent 45%)
               `
          }}
        />

        {/* Drifting Gold Motes */}
        <div className={styles.motes}>
          <span></span>
          <span></span>
          <span></span>
          <span></span>
          <span></span>
          <span></span>
        </div>

        {/* Brand Top */}
        <div className={`${styles.brandTop} ${styles.marcellus} ${styles.fadeIn1} relative z-10 flex items-center gap-3 text-[19px] tracking-[0.04em]`}>
          <span
            className="w-[34px] h-[34px] rounded-full flex items-center justify-center text-[#2B3E34] text-[14.5px] font-semibold"
            style={{
              background: "conic-gradient(from 180deg, #B8924F, #E9C77B, #8C6B33, #B8924F)"
            }}
          >
            IC
          </span>
          Instore Catalogue
        </div>

        {/* Brand Mid */}
        <div className="relative z-10 max-w-[430px]">
          <div className={`${styles.stars} ${styles.fadeIn2} text-[#B8924F] text-[13px] tracking-[8px] mb-[18px]`}>
            · · · ✦ ✦ ✦ ✦ ✦ · · ·
          </div>
          <h1 className={`${styles.cormorant} ${styles.fadeIn3} font-semibold text-[48px] leading-[1.15] text-white`}>
            Happy Moments,<br />Timeless Creations.
          </h1>
          <p className={`${styles.cormorant} ${styles.fadeIn4} text-[19px] text-[#D9D4C7] mt-[18px] max-w-[360px] leading-[1.5]`}>
            Sign in to browse the full collection, manage orders, and build your store's catalogue.
          </p>
        </div>

        {/* Brand Bottom */}
        <div className={`${styles.brandBottom} ${styles.fadeIn5} relative z-10 flex gap-[34px]`}>
          <div className={styles.stat}>
            <div className={`${styles.cormorant} text-[26px] font-bold text-[#B8924F]`}>12K+</div>
            <div className="text-[11px] tracking-[0.06em] uppercase text-[#B9C2BB] mt-1">Products</div>
          </div>
          <div className={styles.stat}>
            <div className={`${styles.cormorant} text-[26px] font-bold text-[#B8924F]`}>40+</div>
            <div className="text-[11px] tracking-[0.06em] uppercase text-[#B9C2BB] mt-1">Branches</div>
          </div>
          <div className={styles.stat}>
            <div className={`${styles.cormorant} text-[26px] font-bold text-[#B8924F]`}>99.9%</div>
            <div className="text-[11px] tracking-[0.06em] uppercase text-[#B9C2BB] mt-1">Uptime</div>
          </div>
        </div>
      </div>

      {/* ===== Right: form panel ===== */}
      <div className="bg-[#FBF7F1] flex md:w-[50%] items-center justify-center p-10 min-h-screen">
        <div className={`${styles.animateCardIn} w-full transition-all duration-300 ${isRegistering ? "max-w-[480px]" : "max-w-[390px]"}`}>

          {/* ===== 1. Registration Form ===== */}
          {isRegistering ? (
            <div>
              <p className="text-[11px] tracking-[0.16em] uppercase text-[#8C6B33] font-semibold mb-[10px]">
                Welcome
              </p>

              <h2 className={`${styles.cormorant} font-bold text-[32px] text-[#2A2420] leading-tight`}>
                Create your account
              </h2>

              <div className="w-[46px] h-[2px] bg-[#B8924F] mt-[8px]"></div>

              <p className="text-[#6B5F55] text-[14px] mt-4 mb-8">
                Join us and start your journey.
              </p>

              <form key="registration" onSubmit={handleRegistration} className="w-full">
                <div className={styles.field}>
                  <input
                    type="text"
                    id="reg_username"
                    name="username"
                    placeholder=" "
                    required
                  />
                  <label htmlFor="reg_username">Username</label>
                </div>

                <div className={styles.field}>
                  <input
                    type="number"
                    id="reg_mobilenumber"
                    name="mobilenumber"
                    placeholder=" "
                    required
                  />
                  <label htmlFor="reg_mobilenumber">Mobile Number</label>
                </div>

                <div className={styles.field}>
                  <input
                    type="email"
                    id="reg_email"
                    name="email"
                    placeholder=" "
                    required
                  />
                  <label htmlFor="reg_email">Email</label>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className={styles.field}>
                    <input
                      type="password"
                      id="reg_password"
                      name="password"
                      placeholder=" "
                      required
                    />
                    <label htmlFor="reg_password">Password</label>
                  </div>
                  <div className={styles.field}>
                    <input
                      type="password"
                      id="reg_confirm_password"
                      name="confirm_password"
                      placeholder=" "
                      required
                    />
                    <label htmlFor="reg_confirm_password">Confirm</label>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className={styles.field}>
                    <input
                      type="text"
                      id="reg_companycode"
                      name="companycode"
                      placeholder=" "
                      required
                    />
                    <label htmlFor="reg_companycode">Company Code</label>
                  </div>
                  <div className={styles.field}>
                    <input
                      type="text"
                      id="reg_branchcode"
                      name="branchcode"
                      placeholder=" "
                      required
                    />
                    <label htmlFor="reg_branchcode">Branch Code</label>
                  </div>
                </div>

                {errorMessage && <ErrorMessage error={errorMessage} />}

                <button
                  type="submit"
                  className={`${styles.loginBtn} mt-4`}
                >
                  Register Now
                </button>

                <div className="flex items-center gap-3 my-6 text-[#6B5F55] text-[10.5px] uppercase tracking-[0.12em] before:content-[''] before:flex-1 before:h-[1px] before:bg-[#2A2420]/12 after:content-[''] after:flex-1 after:h-[1px] after:bg-[#2A2420]/12">
                  or
                </div>

                <p className="text-center text-[13.5px] text-[#6B5F55]">
                  Already have an account?{" "}
                  <span
                    onClick={() => {
                      setErrorMessage("");
                      setIsRegistering(false);
                    }}
                    className="text-[#8C6B33] hover:underline cursor-pointer font-medium inline-flex items-center gap-1"
                  >
                    <KeyRoundIcon size={14} className="mt-[-1px]" /> Back to Login
                  </span>
                </p>
              </form>
            </div>
          ) : loginStep === "otp" ? (
            /* ===== 2. Step 2: OTP Verification Form (When OTP is Enabled) ===== */
            <div className={styles.otpCard}>
              <div className="flex items-center justify-between mb-2">
                <span className={styles.otpBadge}>
                  <ShieldCheck size={13} /> Two-Factor Verification
                </span>
                <span className="text-[11px] font-medium text-[#8C6B33]">
                  Step 2 of 2
                </span>
              </div>

              <h2 className={`${styles.cormorant} font-bold text-[30px] text-[#2A2420] leading-tight`}>
                Enter Verification Code
              </h2>

              <div className="w-[46px] h-[2px] bg-[#B8924F] mt-[6px] mb-4"></div>

              {/* Informational Box showing masked phone */}
              <div className={styles.otpInfoCard}>
                <div className={styles.otpInfoIcon}>
                  <Smartphone size={20} />
                </div>
                <div className={styles.otpInfoText}>
                  We sent a 4-digit security code to your registered mobile{" "}
                  {maskedPhone ? (
                    <span className={styles.otpInfoHighlight}>{maskedPhone}</span>
                  ) : (
                    <span>number</span>
                  )}
                  .
                </div>
              </div>

              <form onSubmit={handleVerifyOtp} className="w-full">
                {/* 4-Digit Box Inputs */}
                <div className={styles.otpInputsGrid}>
                  {otpDigits.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => {
                        otpInputRefs.current[idx] = el;
                      }}
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={idx === 0 ? 4 : 1}
                      value={digit}
                      onChange={(e) => handleOtpDigitChange(idx, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                      className={`${styles.otpDigitInput} ${digit ? styles.otpDigitInputFilled : ""}`}
                      autoFocus={idx === 0}
                    />
                  ))}
                </div>

                {/* Resend Actions & Countdown */}
                <div className={styles.otpActions}>
                  <div className={styles.otpTimerText}>
                    <Clock size={14} className="text-[#8C6B33]" />
                    {resendTimer > 0 ? (
                      <span>Resend in {resendTimer}s</span>
                    ) : (
                      <span className="text-emerald-700 font-medium">Ready to resend</span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={resendTimer > 0 || isResending}
                    className={styles.otpResendBtn}
                  >
                    <RotateCw size={13} className={isResending ? "animate-spin" : ""} />
                    Resend Code
                  </button>
                </div>

                {errorMessage && <ErrorMessage error={errorMessage} />}

                <button
                  type="submit"
                  className={`${styles.loginBtn} ${
                    isButtonDisabled || errorMessage === "Login Successful"
                      ? styles.loginBtnDisabled
                      : ""
                  }`}
                  disabled={isButtonDisabled || errorMessage === "Login Successful"}
                >
                  {errorMessage === "Login Successful" ? "Success!" : "Verify & Sign In"}
                </button>

                <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200/80">
                  <button
                    type="button"
                    onClick={() => {
                      setLoginStep("credentials");
                      setErrorMessage("");
                      setIsButtonDisabled(false);
                    }}
                    className={styles.backToLoginBtn}
                  >
                    <ArrowLeft size={15} /> Change account
                  </button>

                  <span className="text-[12px] text-gray-500 font-medium">
                    User: <strong className="text-gray-700">{email}</strong>
                  </span>
                </div>
              </form>
            </div>
          ) : (
            /* ===== 3. Step 1: Standard / Credentials Login Form ===== */
            <div>
              <div className="flex items-center justify-between mb-1">
                <p className="text-[11px] tracking-[0.16em] uppercase text-[#8C6B33] font-semibold">
                  WELCOME BACK
                </p>
                {isWebOtpEnabled && (
                  <span className="text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <ShieldCheck size={11} /> OTP Security Active
                  </span>
                )}
              </div>

              <h2 className={`${styles.cormorant} font-bold text-[32px] text-[#2A2420] leading-tight`}>
                Sign in to your account
              </h2>

              <div className="w-[46px] h-[2px] bg-[#B8924F] mt-[8px]"></div>

              <p className="text-[#6B5F55] text-[14px] mt-4 mb-8">
                Enter your credentials to access the catalogue.
              </p>

              <form key="login" onSubmit={handleLogin} className="w-full">
                <div className={styles.field}>
                  <input
                    type="text"
                    id="username"
                    name="emailOrPhoneNumber"
                    placeholder=" "
                    required
                    maxLength={50}
                    autoFocus
                    value={email}
                    onChange={(e) => setEmailState(e.target.value)}
                  />
                  <label htmlFor="username">Username</label>
                </div>

                <div className={styles.field}>
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    placeholder=" "
                    required
                    value={password}
                    onChange={(e) => setPasswordState(e.target.value)}
                    className={styles.passwordInput}
                  />
                  <label htmlFor="password">Password</label>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className={styles.fieldIcon}
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOffIcon size={17} /> : <EyeIcon size={17} />}
                  </button>
                </div>

                {errorMessage && <ErrorMessage error={errorMessage} />}

                <button
                  type="submit"
                  className={`${styles.loginBtn} ${
                    isButtonDisabled || errorMessage === "Login Successful"
                      ? styles.loginBtnDisabled
                      : ""
                  }`}
                  disabled={isButtonDisabled || errorMessage === "Login Successful"}
                >
                  {errorMessage === "Login Successful"
                    ? "Success!"
                    : isWebOtpEnabled
                    ? "Continue to Verification"
                    : "Log In"}
                </button>

                <div className="flex items-center my-6">
                  <div className="flex-1 h-px bg-gray-300"></div>

                  <span className="px-4 text-xs font-medium uppercase text-gray-500">
                    OR
                  </span>

                  <div className="flex-1 h-px bg-gray-300"></div>
                </div>

                <p className="text-center text-[13.5px] text-[#6B5F55]">
                  New here?{" "}
                  <span
                    onClick={() => {
                      setErrorMessage("");
                      setIsRegistering(true);
                    }}
                    className="text-[#8C6B33] hover:underline cursor-pointer font-semibold"
                  >
                    Request store access
                  </span>
                </p>
              </form>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default LoginPage;
