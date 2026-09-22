"use client"
import { bhima_boy_Image } from "@/app/Api/api_list";
import { Image } from "antd"
import { default as NextImage } from "next/image";
import { MoveLeft, MoveRight } from 'lucide-react';
import { useState } from "react";
export function ImageMagnifier({
  imageCollection,
  stock,
  branchcode,
}: any) {

  const imageUrls = Array.isArray(imageCollection)
    ? imageCollection.map((image) => image.url)
    : []


  const reorderedUrls = Array.isArray(imageCollection)
    ? [
      ...imageCollection.filter((url: any) => url?.toLowerCase().includes("main")),
      ...imageCollection.filter((url: any) => !url?.toLowerCase().includes("_main")),
    ]
    : [];
  const [currentIndex, setCurrentIndex] = useState(0)

  const goToNextSlide = () => {
    setCurrentIndex((prevIndex: any) =>
      prevIndex === reorderedUrls.length - 1 ? 0 : prevIndex + 1
    )
  }

  const goToPrevSlide = () => {
    setCurrentIndex((prevIndex: any) =>
      prevIndex === 0 ? reorderedUrls.length - 1 : prevIndex - 1
    )
  }

  const circleStyle = {
    width: "32px",
    height: "32px",
    backgroundColor: "#38a169", // Tailwind's bg-green-500
    borderRadius: "50%",
    animation: "wave 1.5s infinite",
  }

  const keyframes = `
    @keyframes wave {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.2); }
    }
  `

  return (
    <div className="relative touch-pinch-zoom border-[1px]  container mx-auto">
      {reorderedUrls?.length > 1 && (
        <button
          onClick={goToPrevSlide}
          className="absolute top-1/2 left-0 transform -translate-y-1/2 bg-gray-300 p-2"
        >
          <MoveLeft />
        </button>
      )}

      <div className="flex justify-center touch-pinch-zoom  items-center px-[12%] py-[15%]">
        {/* Stock Indicator */}
        <div className="absolute top-4 right-2 flex items-center">
          <div
            className={`w-3 h-3 shadow-2xl shadow-green-400 rounded-full ${stock === 0 ? "bg-red-500" : "bg-green-500"
              }`}
          ></div>
          <h5
            className={`ml-2 ${stock === 0 ? "text-red-700" : "text-green-500"
              }`}
          >
            {stock === 0 ? "MTO" : "Instock"}
          </h5>
        </div>

        <div className="absolute top-3 left-6  rounded-md px-2 py-0.5 text-dark  font-bold">
          {branchcode}
        </div>
        {imageUrls.length > 0 ? <Image.PreviewGroup preview items={reorderedUrls.length > 0 ? reorderedUrls : [bhima_boy_Image]}>
          <Image

            src={
              reorderedUrls?.length == 0
                ? bhima_boy_Image
                : reorderedUrls[currentIndex]
            }
            preview

            height={300}
            width={300}
          >

          </Image>
        </Image.PreviewGroup> : <NextImage src={bhima_boy_Image} alt=""
          height={300}
          width={300}></NextImage>}



      </div>



      {imageUrls?.length > 1 && (
        <button
          onClick={goToNextSlide}
          className="absolute top-1/2 right-0 transform -translate-y-1/2 bg-gray-300 p-2"
        >
          <MoveRight />
        </button>
      )}
    </div>
  )
}