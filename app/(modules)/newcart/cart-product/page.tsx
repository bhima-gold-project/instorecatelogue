"use client";
import Image from "next/image";
import { bhima_boy_Image } from "@/app/Api/api_list";
import {
  Font_12px,
  Font_14px,
  Font_18px,
  Font_24px,
} from "@/app/components/labels/page";
import { formatPrice, getDeliveryDate } from "@/app/function/fx";
import {
  deleteLineItem,
  getCentralDbdata,
  UpdateRate,
} from "@/app/function/action";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { useEffect, useState } from "react";
import { useCartData } from "@/app/store/cart/cartdata";
import { useOrderRate } from "@/app/store/useOrderRate";
import { useCartDatafromCentral } from "@/app/store/centralcartdata/central_data";
import { getLoginIdFromToken } from "@/app/function/authUtils";

export default function CartProduct({ extractedObject }: any) {
  const quantity: number = parseFloat(extractedObject?.quantity ?? "");
  const router = useRouter();
  const { refreshCart, clearCartCache, cart } = useCartData();

  const deleteButton = async (id: any) => {
    const res = confirm("Do you want to Remove this product?");
    const uid = getLoginIdFromToken();

    if (res == true) {
      await deleteLineItem(id, uid);
      refreshCart();
      if (cart?.length == 1) {
        clearCartCache()
      }
      // router.refresh();
      // 
    }
  };

  const { centraldata } = useCartDatafromCentral(extractedObject?.barcode);
  const [hasUpdatedRate, setHasUpdatedRate] = useState(false);

  const upadtedata = async () => {
    if (!centraldata) {
      return;
    }
    const data = [centraldata];
    if (data.length > 0) {
      await UpdateRate(data);
    }
  };

  useEffect(() => {
    // Prevent continuous API looping causing SQL Deadlocks (SQL Error 1205)
    // Only trigger UpdateRate ONCE if the central OrderRate differs from the cart OrderRate.
    if (centraldata && centraldata.OrderRate !== extractedObject?.OrderRate && !hasUpdatedRate) {
      upadtedata();
      setHasUpdatedRate(true);
    }
  }, [centraldata?.OrderRate, extractedObject?.OrderRate, hasUpdatedRate]);

  return (
    <div className="bg-[#FFFFFF] border border-[rgba(42,36,32,0.1)] rounded-[14px] p-[18px] flex flex-col md:flex-row gap-[20px] shadow-[0_16px_32px_-24px_rgba(42,36,32,0.3)] opacity-0 translate-y-[16px] animate-[rise_0.55s_ease_forwards] transition-all duration-400 overflow-hidden group">
      <style>{`
        @keyframes rise{ to{ opacity:1; transform:translateY(0); } }
      `}</style>
      <div className="w-full md:w-[160px] h-[200px] md:h-[160px] shrink-0 rounded-[10px] overflow-hidden bg-[#eef3f0] border border-[#d5ded8]">
        <a href={`/products/${extractedObject?.barcode}`} className="block w-full h-full cursor-pointer">
          <img
            src={extractedObject?.thumbnail || (typeof bhima_boy_Image === 'string' ? bhima_boy_Image : (bhima_boy_Image as any)?.src)}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.06]"
            alt={extractedObject?.title || "Product"}
          />
        </a>
      </div>
      <div className="flex-1 flex flex-col">
        <div className="flex items-start justify-between">
          <h2 className="font-cormorant font-semibold text-[21px] tracking-[0.02em] text-[#2A2420]">{extractedObject?.title || "Product"}</h2>
          <div className="flex gap-[6px] flex-wrap justify-end">
            {extractedObject?.stockstatus === 0 ? (
              <span className="text-[10.5px] font-semibold tracking-[0.03em] px-[10px] py-[4px] rounded-full bg-[#FBEAE9] text-[#C25450] whitespace-nowrap">Made To Order</span>
            ) : (<span></span>
              // <span className="text-[10.5px] font-semibold tracking-[0.03em] px-[10px] py-[4px] rounded-full bg-[#E5F2E8] text-[#3E7A53] whitespace-nowrap">{extractedObject?.stockstatus || "In Stock"}</span>
            )}
            <span className="text-[10.5px] font-semibold tracking-[0.03em] px-[10px] py-[4px] rounded-full bg-[#EAF0FA] text-[#3B5A9A] whitespace-nowrap">{centraldata?.branch_code || extractedObject?.branchCode}</span>
          </div>
        </div>
        <div className="text-[12px] text-[#6B5F55] mt-[4px] mb-[14px]">{(extractedObject?.barcode || "-").toString()}</div>

        <div className="flex gap-x-[36px] gap-y-[6px] flex-wrap mb-[16px]">
          <div className="text-[13px]"><span className="text-[#6B5F55]">Metal Rate: </span><span className="font-medium text-[#8C6B33]">{extractedObject?.rateNotFound ? 'xxxx' : formatPrice(extractedObject?.OrderRate, true)}</span></div>
          <div className="text-[13px]"><span className="text-[#6B5F55]">Gross weight: </span><span className="font-medium text-[#8C6B33]">{centraldata?.gwt || extractedObject?.grossWeight || 0} g</span></div>
          <div className="text-[13px]"><span className="text-[#6B5F55]">Net Weight: </span><span className="font-medium text-[#8C6B33]">{centraldata?.nwt || extractedObject?.netWeight || 0} g</span></div>
          <div className="text-[13px]"><span className="text-[#6B5F55]">Purity: </span><span className="font-medium text-[#8C6B33]">{centraldata?.PURITY || extractedObject?.purity || "-"}</span></div>
          <div className="text-[13px]"><span className="text-[#6B5F55]">Quantity: </span><span className="font-medium text-[#8C6B33]">{quantity}</span></div>
        </div>

        <div className="mt-auto flex items-center justify-between border-t border-[rgba(42,36,32,0.1)] md:border-transparent pt-4 md:pt-0">
          <div className="text-[17px] font-bold text-[#2A2420]">{extractedObject?.rateNotFound ? 'xxxx' : formatPrice(String(extractedObject?.total_price * quantity), true)}</div>
          <button className="bg-[#FBEAE9] text-[#C25450] border-none rounded-full px-[18px] py-[8px] text-[12.5px] font-medium cursor-pointer transition-all flex items-center gap-[6px] hover:bg-[#C25450] hover:text-[#FFFFFF] hover:-translate-y-[1px]" onClick={() => deleteButton(extractedObject?.line_item_id)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" className="w-[13px] h-[13px]"><path d="M3 6h18" /><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /></svg>
            Remove
          </button>
        </div>
      </div>
    </div>
  );
}
