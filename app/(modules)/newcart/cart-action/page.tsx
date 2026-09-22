"use client"
import CartProduct from "../cart-product/page"
import { useEffect, useState } from "react"
import Cookies from "js-cookie"
import { checkBranchProductsRate } from "@/app/function/action"
import { getHomeBranchFromToken } from "@/app/function/authUtils"

export default function CartAction({
  cart,
}: any
) {

  const [updatedCart, setUpdatedCart] = useState<any[]>([]);

  // Function to fetch branch-specific rates
  const fetchBranchRates = async () => {
    let home = getHomeBranchFromToken();

    if (!home || !cart) {
      setUpdatedCart(cart);
      return;
    }

    const promises = cart.map(async (item: any) => {
      try {
        const branchData = await checkBranchProductsRate({
          "branchcode": home,
          "BarcodeNo": item.barcode,
          "ProductBranch": item.item_branch
        });

        if (branchData?.success && branchData?.data?.length > 0) {
          const bData: any = branchData.data[0];
          let nwt = bData.NetWT;
          let gwt = bData.GWT;
          let swt = bData.SWT;


          if (branchData?.barcodeDetails?.length > 0 && branchData?.barcodeDetails[0]?.ProductDetails) {
            const productDetails = branchData.barcodeDetails[0].ProductDetails;
            nwt = productDetails.NetWeight;
            gwt = productDetails.GrossWeight;
            swt = productDetails.StoneWeight;

          }
          const stockStatus = branchData?.barcodeDetails?.[0]?.ProductDetails?.Status ?? item.stockStatus;


          return {
            ...item,
            unit_price: bData.FinalAmount,
            total_price: bData.FinalAmount, // Assuming qnty 1 for rate, multiply if needed logic exists elsewhere? Cart logic seems 1 qty based or simplistic here
            va_amount: bData.MakingCharges,
            metal_rate: bData.GoldRate,
            metal_value: bData.GoldAmount,
            grossweight: gwt,
            netweight: nwt,
            stoneweight: swt,
            stockStatus: stockStatus,
            // Add other fields if needed for display
          };
        } else {
          return {
            ...item,
            rateNotFound: true
          }
        }
      } catch (error) {
        console.error("Error fetching branch rate for cart:", error);
        return {
          ...item,
          rateNotFound: true
        }
      }
    });

    const results = await Promise.all(promises);
    setUpdatedCart(results);
  };

  useEffect(() => {
    fetchBranchRates();
  }, [cart]);


  if (!updatedCart) {
    return null
  }

  const formatedData = updatedCart?.map((item: any) => {

    return {
      title: item.title,
      thumbnail: item.thumbnail,
      purity: item.purity,
      stockstatus: item.stockStatus,
      grossWeight: item.grossweight,
      netWeight: item.netweight,
      stoneWeight: item.stoneweight,
      quantity: item.quantity,
      barcode: item.barcode,
      unitprice: item.unit_price || 0,
      gender: item.gender,
      taxableamount: item.total_price || 0,
      vaAmount: item.va_amount || 0,
      OrderRate: item.metal_rate,
      metal_weight: item.metal_weight || 0,
      branchCode: item.item_branch,
      line_item_id: item.line_item_id,
      total_price: item.total_price || 0,
      rateNotFound: item.rateNotFound || false,
    }
  })



  return (
    <>

      {formatedData.map((item: any, id: number) => (
        <CartProduct key={id} extractedObject={item} />
      ))}
    </>
  )
}
