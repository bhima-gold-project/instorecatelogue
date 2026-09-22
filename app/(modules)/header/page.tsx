"use client";

import Link from "next/link";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import SearchProduct from "./searchproduct/page";
import Cookies from "js-cookie";
import { LogOut, PackageCheck, ShoppingCart, User } from "lucide-react";
import { useCartData } from "@/app/store/cart/cartdata";
import { Logout } from "@/app/function/action";
import { getHomeBranchFromToken, getUserNameFromToken } from "@/app/function/authUtils";
import ChangePasswordModal from "@/app/components/modal/ChangePasswordModal";
import { KeyRound } from "lucide-react";


const HeaderPage = () => {

  const [branch, setBranch] = useState<string | null>(null); // Store branch safely
  const [userName, setUserName] = useState<string | null>(null);
  const [isMobileUser, setIsMobileUser] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const { cart } = useCartData();
  // Ensure branch, username, and mobile status are fetched only on the client
  useEffect(() => {
    setBranch(getHomeBranchFromToken() || "");
    setUserName(getUserNameFromToken() || "");
    setIsMobileUser(Cookies.get("is_mobile") === "true");
  }, []);


  return (
    <div className={branch ? "fixed top-0 w-full z-50 animate-in fade-in slide-in-from-top-1 duration-300" : "relative w-full z-50 animate-in fade-in duration-300"}>
      <div className="w-full py-3.5 bg-white border-b border-[#ECE6DC] flex items-center justify-between px-4 md:px-8 selection:bg-amber-100">

        {/* Left: Brand/Logo */}
        <Link href="/" className="flex items-center shrink-0">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#c9a054] via-[#dec58e] to-[#9c7530] flex items-center justify-center text-white font-serif font-bold text-base shadow-sm">
            IC
          </div>
          <span className="font-serif font-medium text-xl md:text-2xl text-[#1E3354] pl-3 leading-none hidden sm:inline-block">
            Instore Catalogue
          </span>
        </Link>

        {/* Small Screen Search */}
        <div className="block lg:hidden flex-1 max-w-[280px] xs:max-w-[340px] ml-4">
          <SearchProduct />
        </div>

        {/* Desktop Wrapper: Search in center, actions on right */}
        <div className="hidden lg:flex flex-1 items-center justify-between ml-12">
          {/* Center Search */}
          <div className="flex-1 max-w-[420px]">
            <SearchProduct />
          </div>

          {/* Right Action Icons */}
          <div className="flex items-center gap-x-6 shrink-0 pl-6">
            {/* User Profile / Username & Branch Code */}
            <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-[#FAF6F0] border border-[#ECE6DC] text-[#2A2420] select-none hover:bg-[#F3EDE2] transition-colors">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#2B3E34] to-[#3C5448] text-white flex items-center justify-center text-xs font-bold uppercase shrink-0 shadow-xs">
                {userName ? userName.slice(0, 1) : <User className="w-3.5 h-3.5 text-white" />}
              </div>
              <div className="flex flex-col text-left leading-tight">
                <span className="text-xs font-bold text-[#2A2420] truncate max-w-[130px]" title={userName || "User"}>
                  {userName || "User"}
                </span>
                <span className="text-[10px] font-semibold text-[#8C6B33] uppercase tracking-wide">
                  {branch ? `Branch: ${branch}` : "Instore"}
                </span>
              </div>
            </div>

            {/* Cart */}
            <Link href="/newcart" className="flex flex-col items-center justify-center text-[#7E7365] hover:text-[#5C5245] cursor-pointer transition-colors relative group">
              <div className="relative">
                <ShoppingCart className="w-5 h-5 text-[#8E8375] group-hover:text-[#5C5245] transition-colors stroke-[2]" />
                <span className="absolute -top-1.5 -right-2 bg-[#9c7530] text-white text-[9px] font-bold rounded-full w-[17px] h-[17px] flex items-center justify-center border border-white">
                  {cart?.length || 0}
                </span>
              </div>
              <span className="text-[11px] font-medium tracking-wide mt-1.5">
                Cart
              </span>
            </Link>

            {/* Orders */}
            <Link href="/order" className="flex flex-col items-center justify-center text-[#7E7365] hover:text-[#5C5245] cursor-pointer transition-colors group">
              <PackageCheck className="w-5 h-5 text-[#8E8375] group-hover:text-[#5C5245] transition-colors stroke-[2]" />
              <span className="text-[11px] font-medium tracking-wide mt-1.5">
                Orders
              </span>
            </Link>

            {/* Change Password (Hidden on Mobile) */}
            {!isMobileUser && (
              <div
                onClick={() => setIsChangePasswordOpen(true)}
                className="flex flex-col items-center justify-center text-[#7E7365] hover:text-[#5C5245] cursor-pointer transition-colors group"
              >
                <KeyRound className="w-5 h-5 text-[#8E8375] group-hover:text-[#5C5245] transition-colors stroke-[2]" />
                <span className="text-[11px] font-medium tracking-wide mt-1.5">
                  Password
                </span>
              </div>
            )}

            {/* Logout (Hidden on Mobile) */}
            {!isMobileUser && (
              <div
                onClick={() => Logout()}
                className="flex flex-col items-center justify-center text-[#7E7365] hover:text-[#5C5245] cursor-pointer transition-colors group"
              >
                <LogOut className="w-5 h-5 text-[#8E8375] group-hover:text-[#5C5245] transition-colors stroke-[2]" />
                <span className="text-[11px] font-medium tracking-wide mt-1.5">
                  Logout
                </span>
              </div>
            )}
          </div>
        </div>

      </div>

      <ChangePasswordModal 
        isOpen={isChangePasswordOpen} 
        onClose={() => setIsChangePasswordOpen(false)} 
      />
    </div>
  );
};

export default HeaderPage;
