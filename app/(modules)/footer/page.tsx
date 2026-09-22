"use client";

import { Home, LogOut, PackageCheck, ShoppingCart, User } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { Logout } from "@/app/function/action";
import { useCartData } from "@/app/store/cart/cartdata";
import { getHomeBranchFromToken, getUserNameFromToken } from "@/app/function/authUtils";

export default function BottomNavigationBar() {
  const [branch, setBranch] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [isMobileUser, setIsMobileUser] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const { cart } = useCartData();

  useEffect(() => {
    setBranch(getHomeBranchFromToken() || "");
    setUserName(getUserNameFromToken() || "");
    setIsMobileUser(Cookies.get("is_mobile") === "true");
  }, []);

  return (
    <nav className={`w-full py-2 lg:hidden flex flex-row border-t border-[#ECE6DC] ${branch ? "fixed" : ""} bottom-0 z-40 bg-white/95 backdrop-blur shadow-[0_-4px_16px_rgba(0,0,0,0.06)]`}>
      <div className="w-full max-w-lg mx-auto flex flex-row justify-around items-center px-2">
        {/* Home */}
        <Link
          href="/"
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg transition-colors ${
            pathname === "/" ? "text-[#2B3E34] font-bold" : "text-[#7E7365] hover:text-[#2A2420]"
          }`}
        >
          <Home className="w-5 h-5 stroke-[2]" />
          <span className="text-[10px] font-medium mt-0.5">Home</span>
        </Link>

        {/* Orders */}
        <Link
          href="/order"
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg transition-colors ${
            pathname.startsWith("/order") ? "text-[#2B3E34] font-bold" : "text-[#7E7365] hover:text-[#2A2420]"
          }`}
        >
          <PackageCheck className="w-5 h-5 stroke-[2]" />
          <span className="text-[10px] font-medium mt-0.5">Orders</span>
        </Link>

        {/* Cart */}
        <Link
          href="/newcart"
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg relative transition-colors ${
            pathname.startsWith("/newcart") || pathname.startsWith("/cart") ? "text-[#2B3E34] font-bold" : "text-[#7E7365] hover:text-[#2A2420]"
          }`}
        >
          <div className="relative">
            <ShoppingCart className="w-5 h-5 stroke-[2]" />
            {cart && cart.length > 0 ? (
              <span className="absolute -top-1.5 -right-2 bg-[#9c7530] text-white text-[9px] font-bold rounded-full min-w-[16px] h-[16px] flex items-center justify-center px-1 border border-white">
                {cart.length}
              </span>
            ) : null}
          </div>
          <span className="text-[10px] font-medium mt-0.5">Cart</span>
        </Link>

        {/* User Profile Section (Username and Branch) */}
        <div className="flex flex-col items-center justify-center py-1 px-2 text-[#2A2420] select-none">
          <div className="w-5 h-5 rounded-full bg-gradient-to-br from-[#2B3E34] to-[#3C5448] text-white flex items-center justify-center text-[9px] font-bold uppercase shadow-2xs">
            {userName ? userName.slice(0, 1) : <User className="w-3 h-3 text-white" />}
          </div>
          <div className="flex flex-col items-center text-center leading-none mt-0.5">
            <span className="text-[10px] font-bold text-[#2A2420] truncate max-w-[70px]" title={userName || "User"}>
              {userName || "Staff"}
            </span>
            <span className="text-[8.5px] font-semibold text-[#8C6B33] uppercase tracking-wide">
              {branch ? `${branch}` : "Instore"}
            </span>
          </div>
        </div>

        {/* Logout (Hidden on Mobile) */}
        {!isMobileUser && (
          <div
            onClick={() => Logout()}
            className="flex flex-col items-center justify-center py-1 px-2 text-[#7E7365] hover:text-rose-600 cursor-pointer transition-colors"
          >
            <LogOut className="w-5 h-5 stroke-[2]" />
            <span className="text-[10px] font-medium mt-0.5">Logout</span>
          </div>
        )}
      </div>
    </nav>
  );
}
