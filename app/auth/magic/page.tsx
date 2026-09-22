"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import {
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  RefreshCw,
  Lock
} from "lucide-react";
import { VerifyMagicToken, GetCartByUserId } from "@/app/function/action";
import { saveAuthSession } from "@/app/function/authUtils";

const getClientDeviceId = (): string | undefined => {
  if (typeof window === "undefined") return undefined;

  // 1. Android Native WebView interface if present
  try {
    const androidId =
      (window as any)?.Android?.getDeviceId?.() ||
      (window as any)?.AndroidDevice?.getId?.() ||
      (window as any)?.device?.uuid;
    if (androidId && String(androidId).trim()) return String(androidId).trim();
  } catch (e) {
    console.warn("Android device ID read note:", e);
  }

  // 2. LocalStorage
  const localId =
    localStorage.getItem("device_id") ||
    localStorage.getItem("DeviceID") ||
    localStorage.getItem("deviceId");
  if (localId && String(localId).trim()) return String(localId).trim();

  // 3. Cookies
  const cookieId =
    Cookies.get("device_id") ||
    Cookies.get("DeviceID") ||
    Cookies.get("deviceId");
  if (cookieId && String(cookieId).trim()) return String(cookieId).trim();

  return undefined;
};

const MagicLoginContent = () => {
  const searchParams = useSearchParams();
  const router = useRouter();

  const token = searchParams.get("token");
  const redirectParam = searchParams.get("redirect");

  const [status, setStatus] = useState<"verifying" | "success" | "error">("verifying");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [authenticatedUser, setAuthenticatedUser] = useState<any>(null);
  const [customDeviceId, setCustomDeviceId] = useState<string>("");
  const [showDeviceIdInput, setShowDeviceIdInput] = useState<boolean>(false);

  const executeVerification = async (rawToken: string, overrideDeviceId?: string) => {
    setStatus("verifying");
    setErrorMessage("");

    try {
      const effectiveDeviceId =
        (overrideDeviceId && overrideDeviceId.trim()) ||
        getClientDeviceId() ||
        undefined;

      const response = await VerifyMagicToken(rawToken, effectiveDeviceId);

      if (response && response.success && response.token) {
        // If device ID was provided/verified, persist it locally for future kiosk sessions
        if (effectiveDeviceId) {
          try {
            localStorage.setItem("device_id", effectiveDeviceId);
            Cookies.set("device_id", effectiveDeviceId, { expires: 365, path: "/" });
          } catch (storageErr) {
            console.warn("Device ID storage note:", storageErr);
          }
        }

        // Clean up mobile cookies if present
        Cookies.remove("is_mobile", { path: "/" });

        // Save Auth Session into Cookie
        saveAuthSession(response.token, response);
        setAuthenticatedUser(response);
        setStatus("success");

        // Prefetch Cart in background
        if (response.LoginID) {
          try {
            await GetCartByUserId(response.LoginID);
          } catch (cErr) {
            console.warn("Cart prefetch note:", cErr);
          }
        }

        toast.success(
          response.UserName
            ? `Welcome, ${response.UserName}!`
            : "Authenticated successfully!"
        );

        // Determine target path
        const destination =
          response.TargetRedirect && response.TargetRedirect !== "/"
            ? response.TargetRedirect
            : redirectParam && redirectParam.startsWith("/")
            ? redirectParam
            : "/";

        setTimeout(() => {
          window.location.href = destination;
        }, 900);
      } else {
        setStatus("error");
        setErrorMessage(
          response?.message ||
            "Unable to verify this login token. It may have expired or already been used."
        );
        if (
          response?.message &&
          (response.message.toLowerCase().includes("device") ||
            response.message.toLowerCase().includes("tablet"))
        ) {
          setShowDeviceIdInput(true);
        }
      }
    } catch (err: any) {
      console.error("Magic link verification error:", err);
      setStatus("error");
      setErrorMessage(
        err?.message || "Failed to reach authentication service. Please try again."
      );
    }
  };

  const handleSaveAndRetryDeviceId = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customDeviceId.trim()) {
      toast.error("Please enter a Device ID.");
      return;
    }
    const cleanId = customDeviceId.trim();
    try {
      localStorage.setItem("device_id", cleanId);
      Cookies.set("device_id", cleanId, { expires: 365, path: "/" });
    } catch (e) {
      console.warn("Local storage write note:", e);
    }
    if (token) {
      executeVerification(token.trim(), cleanId);
    }
  };

  useEffect(() => {
    if (!token || !token.trim()) {
      setStatus("error");
      setErrorMessage("No authentication token provided in the link.");
      return;
    }

    // Pre-populate customDeviceId from local storage if available
    const existing = getClientDeviceId();
    if (existing) {
      setCustomDeviceId(existing);
    }

    executeVerification(token.trim());
  }, [token]);

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-[#FBF7F1] text-[#2A2420] font-sans relative overflow-hidden">
      <Toaster position="top-right" richColors />

      {/* Decorative Background Elements */}
      <div className="absolute inset-0 pointer-events-none opacity-40">
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-[#B8924F]/10 blur-3xl" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-[#3C5448]/10 blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Brand Card */}
        <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-xl border border-[#2A2420]/10 p-8 text-center transition-all duration-300">
          
          {/* Logo / Header */}
          <div className="mb-6 flex flex-col items-center">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#3C5448] to-[#2B3E34] text-[#B8924F] flex items-center justify-center shadow-lg shadow-[#3C5448]/20 mb-3">
              <Sparkles className="w-7 h-7" />
            </div>
            <h1 className="text-2xl font-serif font-bold tracking-wide text-[#2A2420]">
              In-Store Digital Catalogue
            </h1>
            <p className="text-xs uppercase tracking-widest text-[#B8924F] font-semibold mt-1">
              Direct Authentication
            </p>
          </div>

          {/* STATE 1: VERIFYING */}
          {status === "verifying" && (
            <div className="py-6 flex flex-col items-center">
              <div className="relative mb-5">
                <div className="w-16 h-16 rounded-full border-4 border-[#B8924F]/20 border-t-[#B8924F] animate-spin" />
                <Lock className="w-6 h-6 text-[#3C5448] absolute inset-0 m-auto" />
              </div>
              <h2 className="text-lg font-semibold text-[#2A2420] mb-2">
                Verifying Secure Access
              </h2>
              <p className="text-sm text-[#6B5F55] max-w-xs">
                Authenticating your secure link and preparing your catalogue session...
              </p>
            </div>
          )}

          {/* STATE 2: SUCCESS */}
          {status === "success" && (
            <div className="py-6 flex flex-col items-center animate-in fade-in zoom-in duration-300">
              <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mb-5 shadow-inner">
                <CheckCircle2 className="w-9 h-9 animate-bounce" />
              </div>
              <h2 className="text-lg font-semibold text-emerald-800 mb-1">
                Access Granted!
              </h2>
              <p className="text-sm text-[#6B5F55] mb-4">
                {authenticatedUser?.UserName
                  ? `Signed in as ${authenticatedUser.UserName}`
                  : "Authentication confirmed."}
              </p>
              <div className="flex items-center gap-2 text-xs font-medium text-[#B8924F] bg-[#FBF7F1] px-4 py-2 rounded-full border border-[#B8924F]/20">
                <span className="w-2 h-2 rounded-full bg-[#B8924F] animate-pulse" />
                Redirecting to catalogue...
              </div>
            </div>
          )}

          {/* STATE 3: ERROR */}
          {status === "error" && (
            <div className="py-4 flex flex-col items-center animate-in fade-in zoom-in duration-300">
              <div className="w-16 h-16 rounded-full bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mb-4">
                <AlertCircle className="w-8 h-8" />
              </div>
              <h2 className="text-lg font-semibold text-rose-900 mb-2">
                Authentication Link Invalid
              </h2>
              <p className="text-sm text-[#6B5F55] mb-6 leading-relaxed bg-rose-50/60 p-3 rounded-lg border border-rose-100">
                {errorMessage}
              </p>

              {/* Optional: Configure / Save Device ID for this Tablet */}
              {showDeviceIdInput && (
                <div className="w-full my-3 p-3.5 bg-[#FAF6F0] border border-[#B8924F]/30 rounded-xl text-left">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-[#8C6B33] mb-1">
                    <Lock className="w-3.5 h-3.5" />
                    <span>Tablet Hardware ID Setup</span>
                  </div>
                  <p className="text-[11px] text-[#6B5F55] mb-2">
                    Enter the authorized Device ID to pair this tablet kiosk:
                  </p>
                  <form onSubmit={handleSaveAndRetryDeviceId} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. TAB-01"
                      value={customDeviceId}
                      onChange={(e) => setCustomDeviceId(e.target.value)}
                      className="flex-1 px-3 py-1.5 rounded-lg border border-[#DCD3C6] text-xs font-mono bg-white text-[#2A2420] focus:outline-none focus:border-[#B8924F]"
                    />
                    <button
                      type="submit"
                      className="px-3 py-1.5 bg-[#2B3E34] hover:bg-[#3C5448] text-[#F4EFE6] rounded-lg text-xs font-medium transition-colors"
                    >
                      Save & Retry
                    </button>
                  </form>
                </div>
              )}

              <div className="w-full flex flex-col gap-3">
                {token && !showDeviceIdInput && (
                  <button
                    onClick={() => executeVerification(token)}
                    className="w-full py-2.5 px-4 bg-white border border-[#2A2420]/20 rounded-xl text-sm font-medium text-[#2A2420] hover:bg-neutral-50 transition-colors flex items-center justify-center gap-2 shadow-sm"
                  >
                    <RefreshCw className="w-4 h-4 text-[#B8924F]" />
                    Try Again
                  </button>
                )}

                <button
                  onClick={() => router.push("/auth/login")}
                  className="w-full py-2.5 px-4 bg-[#3C5448] hover:bg-[#2B3E34] text-white rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2 shadow-md shadow-[#3C5448]/20"
                >
                  <ShieldCheck className="w-4 h-4 text-[#B8924F]" />
                  Login with OTP / Password
                  <ArrowRight className="w-4 h-4 ml-1" />
                </button>
              </div>
            </div>
          )}

          {/* Footer note */}
          <div className="mt-8 pt-4 border-t border-[#2A2420]/10 flex items-center justify-center gap-2 text-xs text-[#6B5F55]">
            <ShieldCheck className="w-4 h-4 text-[#B8924F]" />
            <span>End-to-End Encrypted Access Link</span>
          </div>

        </div>
      </div>
    </div>
  );
};

export default function MagicLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen w-full flex items-center justify-center bg-[#FBF7F1] text-[#2A2420]">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 rounded-full border-4 border-[#B8924F]/30 border-t-[#B8924F] animate-spin" />
            <p className="text-sm text-[#6B5F55]">Loading secure portal...</p>
          </div>
        </div>
      }
    >
      <MagicLoginContent />
    </Suspense>
  );
}
