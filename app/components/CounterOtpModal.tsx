"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { 
  ShieldCheck, 
  Lock, 
  X, 
  RotateCw, 
  AlertCircle, 
  CheckCircle2, 
  KeyRound, 
  Smartphone 
} from "lucide-react";
import { toast } from "sonner";
import { GenerateLoginOtp, VerifyLoginOtp } from "@/app/function/action";
import { getLoginIdFromToken, getUserNameFromToken } from "@/app/function/authUtils";

interface CounterOtpModalProps {
  isOpen: boolean;
  counterName: string;
  counterCode: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function CounterOtpModal({
  isOpen,
  counterName,
  counterCode,
  onSuccess,
  onCancel,
}: CounterOtpModalProps) {
  const [otpDigits, setOtpDigits] = useState<string[]>(["", "", "", ""]);
  const [isSendingOtp, setIsSendingOtp] = useState<boolean>(false);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [otpSent, setOtpSent] = useState<boolean>(false);
  const [maskedPhone, setMaskedPhone] = useState<string>("");
  const [resendTimer, setResendTimer] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Reset state when modal opens or target counter changes
  useEffect(() => {
    if (isOpen) {
      setOtpDigits(["", "", "", ""]);
      setErrorMessage("");
      setOtpSent(false);
      setMaskedPhone("");
      setResendTimer(0);
    }
  }, [isOpen, counterCode]);

  // Lock background scroll and handle Escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onCancel();
      }
    };

    window.addEventListener("keydown", handleGlobalKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleGlobalKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen, onCancel]);

  // Resend countdown timer
  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | undefined;
    if (resendTimer > 0) {
      timer = setInterval(() => {
        setResendTimer((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [resendTimer]);

  // Helper to extract authenticated user identifier
  const getAuthIdentifier = useCallback((): string => {
    return getUserNameFromToken() || String(getLoginIdFromToken() || "admin");
  }, []);

  // Send / Resend OTP
  const handleSendOtp = async () => {
    if (isSendingOtp) return;
    setIsSendingOtp(true);
    setErrorMessage("");

    try {
      const username = getAuthIdentifier();
      const res = await GenerateLoginOtp(username, undefined, {
        isCounterOtp: true,
        counterCode,
        counterName,
        loginId: getLoginIdFromToken(),
      });

      if (res && res.success) {
        setOtpSent(true);
        setResendTimer(30);
        const phone = res.MobileNo || "";
        setMaskedPhone(phone);

        if (phone) {
          toast.success(`OTP sent to ${phone}`);
        } else {
          toast.success(res.message || `OTP sent successfully for counter ${counterCode}`);
        }

        // Auto-focus first digit box
        setTimeout(() => inputRefs.current[0]?.focus(), 150);
      } else {
        const errMsg = res?.message || "Failed to generate OTP. Please try again.";
        setErrorMessage(errMsg);
        toast.error(errMsg);
      }
    } catch (err: any) {
      console.error("Error generating OTP:", err);
      const errMsg = err?.message || "Failed to send OTP SMS. Please try again.";
      setErrorMessage(errMsg);
      toast.error(errMsg);
    } finally {
      setIsSendingOtp(false);
    }
  };

  // Central verification logic
  const triggerVerification = useCallback(async (code: string) => {
    if (!code || code.length < 4 || isVerifying) return;

    setIsVerifying(true);
    setErrorMessage("");

    try {
      const username = getAuthIdentifier();
      const res = await VerifyLoginOtp(username, code, {
        isCounterOtp: true,
        counterCode,
        counterName,
        loginId: getLoginIdFromToken(),
      });

      if (res && res.success) {
        toast.success(`Access granted for counter: ${counterName} (${counterCode})`);
        onSuccess();
      } else {
        const msg = res?.message || "Invalid OTP entered. Please try again.";
        setErrorMessage(msg);
        toast.error(msg);
      }
    } catch (err: any) {
      console.error("Error verifying OTP:", err);
      const msg = err?.message || "Verification failed. Please check the OTP.";
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setIsVerifying(false);
    }
  }, [counterCode, counterName, getAuthIdentifier, isVerifying, onSuccess]);

  // Form submit handler
  const handleVerify = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const code = otpDigits.join("").trim();
    if (code.length < 4) {
      setErrorMessage("Please enter the complete 4-digit OTP.");
      return;
    }
    triggerVerification(code);
  };

  // Clipboard paste support (e.g. pasting "4321")
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 4);
    if (!pasted) return;

    const newDigits = ["", "", "", ""];
    pasted.split("").forEach((ch, idx) => {
      if (idx < 4) newDigits[idx] = ch;
    });
    setOtpDigits(newDigits);
    setErrorMessage("");

    const targetIdx = Math.min(pasted.length, 3);
    inputRefs.current[targetIdx]?.focus();

    if (pasted.length === 4) {
      setTimeout(() => triggerVerification(pasted), 120);
    }
  };

  // Individual digit input handler
  const handleDigitChange = (index: number, val: string) => {
    const cleanVal = val.replace(/\D/g, "");
    if (!cleanVal) {
      const updated = [...otpDigits];
      updated[index] = "";
      setOtpDigits(updated);
      setErrorMessage("");
      return;
    }

    const updated = [...otpDigits];
    updated[index] = cleanVal.slice(-1);
    setOtpDigits(updated);
    setErrorMessage("");

    if (index < 3) {
      inputRefs.current[index + 1]?.focus();
    } else {
      // Check if all 4 digits are completed
      const fullOtp = updated.join("");
      if (fullOtp.length === 4) {
        setTimeout(() => triggerVerification(fullOtp), 120);
      }
    }
  };

  // Key navigation (backspace, left/right arrows)
  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (!otpDigits[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  if (!isOpen) return null;

  const isFormComplete = otpDigits.join("").length === 4;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white border border-[#B8924F]/30 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header Band */}
        <div className="bg-gradient-to-r from-[#2A2420] via-[#3D342E] to-[#2A2420] px-6 py-5 text-white flex items-center justify-between border-b border-[#B8924F]/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#B8924F]/20 border border-[#B8924F]/40 flex items-center justify-center text-[#B8924F]">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-cormorant text-xl font-bold text-[#F4EDE2] tracking-wide">
                OTP Required
              </h3>
              <p className="text-[11px] text-[#D8C7B5] font-jost">
                Protected Counter Security Access
              </p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="text-[#D8C7B5] hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/10"
            title="Cancel"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 bg-[#FAF7F2]">
          
          {/* Target Counter Info Card */}
          <div className="bg-white border border-[#B8924F]/20 rounded-xl p-4 flex items-center justify-between shadow-sm">
            <div>
              <div className="text-[11px] uppercase tracking-wider text-[#8C6B33] font-semibold font-jost">
                Selected Restricted Counter
              </div>
              <div className="text-base font-bold text-[#2A2420] font-cormorant flex items-center gap-2 mt-0.5">
                <span>{counterName || "Restricted Counter"}</span>
                <span className="px-2 py-0.5 text-xs font-mono font-bold bg-[#B8924F]/15 text-[#8C6B33] rounded border border-[#B8924F]/30">
                  {counterCode}
                </span>
              </div>
            </div>
            <div className="text-amber-600 bg-amber-50 p-2 rounded-full border border-amber-200">
              <ShieldCheck className="w-6 h-6" />
            </div>
          </div>

          <p className="text-xs text-[#5A4F46] font-jost leading-relaxed">
            Access to <strong>{counterName} ({counterCode})</strong> products requires OTP validation as configured in the Counter Security Settings.
          </p>

          {/* Active Error Banner */}
          {errorMessage && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-xs px-3.5 py-2.5 rounded-lg flex items-center gap-2 animate-in fade-in duration-150">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Masked Phone Confirmation Badge */}
          {otpSent && maskedPhone && (
            <div className="flex items-center justify-center gap-2 text-xs text-[#8C6B33] bg-[#B8924F]/10 py-2 px-3 rounded-lg border border-[#B8924F]/25 font-medium animate-in fade-in duration-150">
              <Smartphone className="w-4 h-4 shrink-0" />
              <span>OTP code sent via SMS to <strong>{maskedPhone}</strong></span>
            </div>
          )}

          {/* State 1: Prompt to Send OTP */}
          {!otpSent ? (
            <div className="space-y-3 pt-2">
              <button
                type="button"
                onClick={handleSendOtp}
                disabled={isSendingOtp}
                className="w-full bg-[#B8924F] hover:bg-[#A37E3E] active:scale-[0.99] text-white py-3 px-4 rounded-xl font-medium text-sm transition-all duration-200 shadow-md shadow-[#B8924F]/20 flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
              >
                {isSendingOtp ? (
                  <>
                    <RotateCw className="w-4 h-4 animate-spin" />
                    Sending OTP via SMS...
                  </>
                ) : (
                  <>
                    <KeyRound className="w-4 h-4" />
                    Generate & Send OTP
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={onCancel}
                className="w-full bg-transparent hover:bg-gray-100 text-[#5A4F46] py-2.5 px-4 rounded-xl font-medium text-xs transition-colors cursor-pointer"
              >
                Cancel & Choose Different Counter
              </button>
            </div>
          ) : (
            /* State 2: 4-Digit OTP Entry Form */
            <form onSubmit={handleVerify} className="space-y-4 pt-1">
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#5A4F46] mb-2 font-jost text-center">
                  Enter 4-Digit Security OTP
                </label>
                <div className="flex justify-center gap-3">
                  {otpDigits.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => { inputRefs.current[idx] = el; }}
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleDigitChange(idx, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(idx, e)}
                      onPaste={handlePaste}
                      className="w-12 h-14 text-center text-2xl font-bold font-mono border-2 border-[#D8C7B5] bg-white rounded-xl text-[#2A2420] outline-none focus:border-[#B8924F] focus:ring-4 focus:ring-[#B8924F]/15 transition-all shadow-inner"
                      autoComplete="one-time-code"
                    />
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2.5 pt-2">
                <button
                  type="submit"
                  disabled={isVerifying || !isFormComplete}
                  className="w-full bg-[#B8924F] hover:bg-[#A37E3E] active:scale-[0.99] text-white py-3 px-4 rounded-xl font-semibold text-sm transition-all duration-200 shadow-md shadow-[#B8924F]/25 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                >
                  {isVerifying ? (
                    <>
                      <RotateCw className="w-4 h-4 animate-spin" />
                      Verifying Code...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      Verify & Access Counter
                    </>
                  )}
                </button>

                <div className="flex items-center justify-between pt-1 text-xs">
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={resendTimer > 0 || isSendingOtp}
                    className="text-[#8C6B33] hover:underline font-medium disabled:opacity-50 disabled:no-underline cursor-pointer disabled:cursor-not-allowed"
                  >
                    {resendTimer > 0 ? `Resend OTP in ${resendTimer}s` : "Resend OTP"}
                  </button>

                  <button
                    type="button"
                    onClick={onCancel}
                    className="text-gray-500 hover:text-gray-700 cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </form>
          )}

        </div>
      </div>
    </div>
  );
}
