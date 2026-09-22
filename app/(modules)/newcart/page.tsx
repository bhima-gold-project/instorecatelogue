"use client"

import Cookies from "js-cookie"
import { GetCartByUserId } from "@/app/function/action"
import BhimaEmptyScreenTemplete from "../EmptyScreen/page"
import CartTemplates from "./cart-template/page"
import { useEffect, useState } from "react"
import { useCartData } from "@/app/store/cart/cartdata"

export default function Cart() {
 
 const {cart,refreshCart}= useCartData()


//  refreshCart()
  if (!cart) {
   return <BhimaEmptyScreenTemplete message="Your cart is empty" />
  }

  if (cart?.length > 0) {
    return <CartTemplates  cart={cart} />
  } else {
    return <BhimaEmptyScreenTemplete message="Your cart is empty" />
  }
}