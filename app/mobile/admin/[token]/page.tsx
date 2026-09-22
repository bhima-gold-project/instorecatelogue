"use client";

import React, { Suspense } from "react";
import { MobileAdminContent } from "../page";

export default function MobileAdminTokenPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen w-full flex items-center justify-center bg-[#FBF7F1]">
          <div className="flex flex-col items-center gap-3">
            <div className="w-9 h-9 border-3 border-[#B8924F] border-t-transparent rounded-full animate-spin"></div>
            <span className="text-xs font-semibold text-[#8C6B33] uppercase tracking-wider">Verifying token...</span>
          </div>
        </div>
      }
    >
      <MobileAdminContent />
    </Suspense>
  );
}
