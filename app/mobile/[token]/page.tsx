"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { decodeJwtToken, saveAuthSession } from "@/app/function/authUtils";
import { GetCartByUserId } from "@/app/function/action";
import Cookies from "js-cookie";
import { ShieldAlert, Smartphone, Lock } from "lucide-react";

function MobileTokenContent() {
  const params = useParams();
  const [accessDenied, setAccessDenied] = useState(false);
  const [deniedMessage, setDeniedMessage] = useState("");

  useEffect(() => {
    const rawToken = params?.token;

    if (!rawToken || typeof rawToken !== "string") {
      setAccessDenied(true);
      setDeniedMessage("No authentication token provided in URL. Please access through your authorized mobile application.");
      return;
    }

    let token = rawToken;
    try {
      token = decodeURIComponent(rawToken);
    } catch {
      token = rawToken;
    }

    try {
      const decoded = decodeJwtToken(token);

      if (!decoded) {
        setAccessDenied(true);
        setDeniedMessage("Invalid authentication token format. Access denied.");
        return;
      }

      if (decoded.exp && decoded.exp * 1000 < Date.now()) {
        setAccessDenied(true);
        setDeniedMessage("Authentication token has expired. Access denied.");
        return;
      }

      // Save token, branch, and mark mobile session
      const session = saveAuthSession(token);
      Cookies.set("is_mobile", "true", { expires: 7, path: "/" });

      const loginId = session?.loginId || decoded?.loginId;
      if (loginId) {
        GetCartByUserId(loginId).catch((err) => {
          console.error("Cart prefetch error in mobile login:", err);
        });
      }

      // Valid token -> direct entry to home page
      window.location.replace("/");
    } catch (err: any) {
      console.error("Mobile token auth error:", err);
      setAccessDenied(true);
      setDeniedMessage("Failed to verify access credentials. Access denied.");
    }
  }, [params]);

  if (accessDenied) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-[#FBF7F1] p-4 select-none">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-[#E8E1D5] p-8 text-center transition-all duration-300">
          {/* Brand Logo Header */}
          <div className="flex items-center justify-center gap-3 mb-6">
            <span
              className="w-10 h-10 rounded-full flex items-center justify-center text-[#2B3E34] text-base font-bold shadow-sm"
              style={{
                background: "conic-gradient(from 180deg, #B8924F, #E9C77B, #8C6B33, #B8924F)"
              }}
            >
              IC
            </span>
            <span className="text-xl font-bold tracking-wide text-[#2A2420]">
              Instore Catalogue
            </span>
          </div>

          {/* Access Denied Icon & Content */}
          <div className="py-4 flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center mb-4 text-rose-600 shadow-inner">
              <ShieldAlert className="w-8 h-8" />
            </div>

            <h1 className="text-2xl font-bold text-[#2A2420] mb-2 font-serif">
              Access Denied
            </h1>

            <p className="text-sm text-[#6B5F55] max-w-xs leading-relaxed mb-2 font-medium">
              {deniedMessage}
            </p>
          </div>

          {/* Footer Info */}
          <div className="mt-6 pt-4 border-t border-[#F0EBE1] text-xs text-[#9E948A] flex items-center justify-center gap-1.5">
            <Lock className="w-3.5 h-3.5" />
            <span>Secure Mobile Gateway</span>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

export default function MobileTokenLoginPage() {
  return (
    <Suspense fallback={null}>
      <MobileTokenContent />
    </Suspense>
  );
}
