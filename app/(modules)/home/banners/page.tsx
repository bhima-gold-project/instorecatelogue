"use client"
import { ADMIN_BASE_URl, bhima_boy_Image } from '@/app/Api/api_list'
import React, { useCallback, useEffect, useState } from 'react'
import { getBanner } from '@/app/function/action'

const Banners = () => {
  const [banner, setBanner] = useState<any[]>([])

  const getBannerData = async () => {
    const res = await getBanner()
    if (res && Array.isArray(res)) {
      setBanner(res)
    }
  }

  useEffect(() => {
    getBannerData()
  }, [])

  const [currentIndex, setCurrentIndex] = useState(0)

  const totalBanners = banner.length

  const nextSlide = useCallback(() => {
    if (totalBanners === 0) return
    setCurrentIndex((prevIndex) => (prevIndex + 1) % totalBanners)
  }, [totalBanners])

  useEffect(() => {
    if (totalBanners <= 1) return
    const interval = setInterval(nextSlide, 2800)
    return () => clearInterval(interval)
  }, [nextSlide, totalBanners])

  return (
    <div className="mt-16 px-4 md:px-11 pt-8 pb-2">
      {banner.length > 0 ? (
        <div
          className="relative w-full rounded-[18px] overflow-hidden shadow-[0_26px_54px_-28px_rgba(43,62,52,0.4)]"
          style={{ aspectRatio: '1024 / 331' }}
        >
          {/* Slides */}
          {banner.map((bannerimage: any, index: number) => {
            const imgUrl = bannerimage.ImageUrl
              ? (bannerimage.ImageUrl.startsWith('http') ? bannerimage.ImageUrl : `${ADMIN_BASE_URl}${bannerimage.ImageUrl}`)
              : (bannerimage.isStatic ? bannerimage.image_url : `${ADMIN_BASE_URl}${bannerimage?.image_url}`);
            return (
              <img
                key={index}
                src={imgUrl}
                alt={bannerimage.Name || bannerimage.title || `Banner collection ${index + 1}`}
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${currentIndex === index
                  ? "opacity-100 z-10"
                  : "opacity-0 z-0"
                  }`}
              />
            )
          })}

          {/* Dot Indicators */}
          {totalBanners > 1 && (
            <div className="absolute bottom-[4%] left-1/2 -translate-x-1/2 flex gap-[7px] z-20">
              {banner.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${currentIndex === index
                    ? "bg-white w-[18px] rounded-[4px]"
                    : "bg-white/45 w-1.5"
                    }`}
                  aria-label={`Slide ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      ) : (
        <div
          className="relative w-full rounded-[18px] overflow-hidden shadow-[0_26px_54px_-28px_rgba(43,62,52,0.4)] bg-white border border-[rgba(42,36,32,0.1)] flex items-center justify-center"
          style={{ aspectRatio: '1024 / 331' }}
        >
          <div className="text-center p-6 flex flex-col items-center justify-center">
            <span className="font-cormorant font-bold text-2xl md:text-4xl text-ink-soft tracking-wide mb-2">
              No Banner
            </span>
            <span className="font-jost text-xs md:text-sm text-ink-soft/60 uppercase tracking-[0.12em]">
              Banners are currently unavailable
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

export default Banners