"use client"

import { Heading_58px_500_lora_Responsive } from "@/app/components/labels/page"
import CartAction from "../cart-action/page"
import CheckoutPage from "../../checkout/page"
import { Suspense } from "react"
import { Spinner } from "@nextui-org/react"
import Cookies from "js-cookie"

export default function CartTemplates({
  cart
}: any
) {



  return (
    <div className="p-[36px] bg-[#FBF7F1] min-h-screen">
      <style>{`
        @keyframes rise{ to{ opacity:1; transform:translateY(0); } }
      `}</style>
      <h1 className=" mt-16 font-cormorant font-bold text-[40px] text-[#2A2420] mb-[26px] relative inline-block pb-[10px] after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-[54px] after:h-[2px] after:bg-[#B8924F]">
        Shopping Cart
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-[26px] items-start">
        {/* Cart Section */}
        <div className="flex flex-col gap-[18px]">
          <CartAction cart={cart} />
        </div>

        {/* Checkout Section */}
        <div className="sticky top-[90px] opacity-0 translate-y-[16px] animate-[rise_0.6s_ease_0.1s_forwards]">
          <Suspense fallback={<Spinner />}>
            <CheckoutPage cart={cart} />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
