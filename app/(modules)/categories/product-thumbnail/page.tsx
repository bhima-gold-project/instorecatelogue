"use client"
import Image from "next/image"
import { bhima_boy_Image } from "@/app/Api/api_list"
import { formatPrice } from "@/app/function/fx"
import Link from "next/link"
import React from "react"

const ProductThumbnail = React.memo(
  ({
    imageUrl,
    label,
    amount,
    barcode,
    inventoryQuantity,
    onRefresh,
    productbranch,
    showAmount = true,
    showTitle = true,
    showBranchCode = false,
    showWeight = false,
    showCarat = false,
    showGrossWeight = false,
    showNetWeight = false,
    weight,
    carat,
    grossWeight,
    netWeight,
    index = 0
  }: any) => {

    return (
      <Link
        href={`/products/${barcode}`}
        target="_blank"
        className="group bg-white border border-[rgba(42,36,32,0.1)] rounded-[14px] overflow-hidden flex flex-col no-underline text-ink opacity-100 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_26px_44px_-22px_rgba(184,146,79,0.4)] hover:border-[rgba(184,146,79,0.4)] animate-in fade-in slide-in-from-bottom-4"
        style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'both' }}
      >
        <div className="relative aspect-square bg-gradient-to-br from-[#fafafa] to-[#f1efe9] overflow-hidden">

          {inventoryQuantity === 0 && (
            <span className="absolute top-2.5 left-2.5 z-10 bg-gold text-white text-[10px] font-semibold tracking-[0.04em] px-2.5 py-[3px] rounded-full">
              MTO
            </span>
          )}

          <div className="relative w-full h-full p-3.5">
            <Image
              src={imageUrl || bhima_boy_Image}
              alt={label || "Product Image"}
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              className="object-contain p-3.5 transition-transform duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)] group-hover:scale-[1.08] mix-blend-multiply"
              unoptimized
            />
          </div>

          <div className="absolute left-0 right-0 -bottom-11 h-[38px] bg-emerald text-[#F4EFE6] flex items-center justify-center text-[11.5px] tracking-[0.08em] uppercase transition-[bottom] duration-300 group-hover:bottom-0">
            Quick View
          </div>
        </div>

        <div className="p-3.5 px-4 pb-4 bg-white z-10 relative">
          {showTitle && (
            <div className="text-[11.5px] tracking-[0.04em] uppercase text-ink-soft mb-2 line-clamp-1">
              {label}
            </div>
          )}

          <div className="grid grid-cols-2 gap-x-1 gap-y-1 mb-1">
            {showBranchCode && (
              <div className="text-[11px] tracking-[0.04em] text-ink-soft">
                Branch: <span className="font-medium text-ink">{productbranch || '-'}</span>
              </div>
            )}

            {showWeight && (
              <div className="text-[11px] tracking-[0.04em] text-ink-soft">
                Wt: <span className="font-medium text-ink">{(Number(weight || 0) / 1000).toFixed(3)}g</span>
              </div>
            )}

            {showGrossWeight && (
              <div className="text-[11px] tracking-[0.04em] text-ink-soft">
                GWt: <span className="font-medium text-ink">{(Number(grossWeight || 0)).toFixed(3)}g</span>
              </div>
            )}

            {showNetWeight && (
              <div className="text-[11px] tracking-[0.04em] text-ink-soft">
                NWt: <span className="font-medium text-ink">{(Number(netWeight || 0)).toFixed(3)}g</span>
              </div>
            )}

            {showCarat && (
              <div className="text-[11px] tracking-[0.04em] text-ink-soft">
                Carat: <span className="font-medium text-ink">{Number(carat || 0).toFixed(3)} ct</span>
              </div>
            )}
          </div>

          {showAmount && amount !== "₹NaN" && (
            <div className="font-jost text-[15.5px] font-medium text-ink mt-1">
              {amount === 'xxxx' ? 'xxxx' : formatPrice(amount, true)}
            </div>
          )}
        </div>
      </Link>
    )
  }
)
ProductThumbnail.displayName = "ProductThumbnail"
export default ProductThumbnail
