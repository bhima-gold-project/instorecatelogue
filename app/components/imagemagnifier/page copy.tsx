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
}:any) {
  // const imageUrls =
  //   imageCollection.map((image) => image.url)

  const imageUrls = Array.isArray(imageCollection)
    ? imageCollection.map((image) => image.url)
    : []

  // const reorderedUrls = [
  //   ...imageCollection?.filter((url: any) => url?.toLowerCase().includes("main")), // Main image first (case-insensitive)
  //   ...imageCollection?.filter((url: any) => !url?.toLowerCase().includes("_main")), // Remaining images
  // ]
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
console.log("====vvvv=====",reorderedUrls)
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
    <div className="relative touch-pinch-zoom border-[1px] container mx-auto">
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
            className={`w-3 h-3 shadow-2xl shadow-green-400 rounded-full ${
              stock === 0 ? "bg-red-500" : "bg-green-500"
            }`}
          ></div>
          <h5
            className={`ml-2 ${
              stock === 0 ? "text-red-700" : "text-green-500"
            }`}
          >
            {stock === 0 ? "" : ""}
          </h5>
        </div>
        {/* <div>
          <style>{keyframes}</style>{" "}
          <div style={circleStyle}></div>
        </div> */}
        {/* Branch Code - Always Displayed */}
        <div className="absolute top-3 left-6  rounded-md px-2 py-0.5 text-dark  font-bold">
          {branchcode}
        </div>
      {imageUrls.length>0?  <Image.PreviewGroup  preview items={reorderedUrls.length>0?reorderedUrls:[bhima_boy_Image] }>
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
       </Image.PreviewGroup>:<NextImage src={bhima_boy_Image} alt="" 
          height={300}
          width={300}></NextImage>}

        {/* <ImageMagnifiers
          src={
            reorderedUrls?.length == 0
              ? bhima_boy_Image
              : reorderedUrls[currentIndex]
          }
          magnifierHeight={300}
          magnifierWidth={300}
          zoom={3}
        /> */}

        {/* <TransformWrapper>
          <TransformComponent>
            <Image
              src={
                imageUrls[currentIndex] === "image"
                  ? bhima_boy_Image
                  : imageUrls[currentIndex]
              }
              // src={
              //   imageUrls == bhima_boy_Image
              //     ? bhima_boy_Image
              //     : imageUrls[currentIndex]
              // }
              alt={`Slide ${currentIndex + 1}`}
              height={400}
              width={400}
              quality={100}
              className="transition-all duration-500 cursor-pointer"
            />
          </TransformComponent>
        </TransformWrapper> */}
      </div>

      {/* <ReactImageMagnify
        {...{
          smallImage: {
            alt: "Wristwatch by Ted Baker London",
            isFluidWidth: true,
            src:
              imageUrls[currentIndex] === "image"
                ? bhima_boy_Image
                : imageUrls[currentIndex],
          },
          largeImage: {
            src:
              imageUrls[currentIndex] === "image"
                ? bhima_boy_Image
                : imageUrls[currentIndex],
            width: 1200,
            height: 1800,
          },
        }}
      /> */}
      {/* 
      <GlassMagnifier
        imageSrc={
          imageUrls[currentIndex] === "image"
            ? bhima_boy_Image
            : imageUrls[currentIndex]
        }
        imageAlt="Example"
      />
      <Magnifier
        imageSrc={
          imageUrls[currentIndex] === "image"
            ? bhima_boy_Image
            : imageUrls[currentIndex]
        }
        imageAlt="Example"
        largeImageSrc="./large-image.jpg" // Optional
        mouseActivation={MOUSE_ACTIVATION.DOUBLE_CLICK} // Optional
        touchActivation={TOUCH_ACTIVATION.DOUBLE_TAP} // Optional
      /> */}

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