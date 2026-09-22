"use client";
import { Font_16px } from "@/app/components/labels/page";
import { formatPrice } from "@/app/function/fx";
import { useEffect, useState } from "react";
import AdressPage from "../adress/page";
import ConfirmOrder from "../confirmOrder/page";
import { getCentralDbdataforcart, checkBranchProductsRate } from "@/app/function/action";
import { getHomeBranchFromToken } from "@/app/function/authUtils";
import Cookies from "js-cookie";

export default function CheckoutPage({ cart }: any) {
  const [totalDiscountedAmountState, setTotalDiscountAmountState] = useState(0);
  const [totalAmountState, setTotalAmountState] = useState(0);
  const [discountAmt, setDiscountAmtState] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);
  const [gstAmount, setGstAmount] = useState(0);
  const [customerdata, setcustomerdata] = useState<any>([]);
  const [goldrate, setgoldrate] = useState(0);

  function roundTotalPrice(totalPrice: any) {
    return Math.round(totalPrice);
  }

  const handleRewardAmt = (amt: number) => {
    const newAmount = totalDiscountedAmountState - amt;
    setTotalDiscountAmountState(newAmount);
    setDiscountAmtState(amt);
  };

  const getCustomer = (data: any) => {
    setcustomerdata(data);
  };

  const calculateGrandTotal = async () => {
    if (!cart?.length) return 0; // Ensure cart is not empty

    let home = getHomeBranchFromToken();

    // Fetch all data in parallel using Promise.all
    const centralDataArray = await Promise.all(
      cart.map(async (item: any) => {
        let data = await getCentralDbdataforcart(item.barcode);

        if (home && data) {
          try {
            const branchData = await checkBranchProductsRate({
              "branchcode": home,
              "BarcodeNo": item.barcode,
              "ProductBranch": data.branch_code
            });

            if (branchData?.success && branchData?.data?.length > 0) {
              const bData = branchData.data[0];
              data = {
                ...data,
                grandTotal: bData.FinalAmount,
                taxAmount: bData.GSTAmount
              }
            }
          } catch (e) {
            console.error("Error fetching branch rate for checkout:", e);
          }
        }
        return data;
      })
    );

    // Calculate total from fetched data
    let totalGst = 0;
    const grandTotal = centralDataArray.reduce((total, data) => {
      totalGst += (data?.taxAmount || 0);
      return total + (data?.grandTotal || 0);
    }, 0);

    setTotalAmountState(grandTotal);
    setGstAmount(totalGst);

    return grandTotal;
  };


  useEffect(() => {
    // setTotalPrice(calculateTotalPriceForItems()); // This seems redundant if we use calculateGrandTotal
    calculateGrandTotal();
  }, [cart]);

  //   console.log(cart,"cart data in total price=====>>")

  return (
    <div className="bg-[#FFFFFF] border border-[rgba(42,36,32,0.1)] rounded-[14px] p-[24px] shadow-[0_16px_32px_-24px_rgba(42,36,32,0.3)] flex flex-col">
      <style>{`
        @keyframes shimmer{ 0%{ left:-60%; } 50%{ left:130%; } 100%{ left:130%; } }
      `}</style>

      <div className="w-full flex flex-col">
        <AdressPage cart={cart} getcustomerdata={getCustomer} />
      </div>

      <div className="h-[1px] bg-[rgba(42,36,32,0.1)] my-[18px]"></div>

      <div className="flex justify-between text-[13.5px] text-[#6B5F55] py-[6px]">
        <span>GST Amount</span>
        <span>{formatPrice(String(roundTotalPrice(gstAmount)), true)}</span>
      </div>

      <div className="flex justify-between text-[17px] font-bold text-[#2A2420] border-t border-[rgba(42,36,32,0.1)] mt-[6px] pt-[14px]">
        <span>Total</span>
        <span className="text-[#8C6B33]">{formatPrice(String(roundTotalPrice(totalAmountState)), true)}</span>
      </div>

      <div className="w-full mt-2">
        <ConfirmOrder
          amount={totalAmountState}
          cart={cart}
          customer={customerdata[0]}
          customerId={customerdata[1]?.customerid}
        ></ConfirmOrder>
      </div>
    </div>
  );
}
