"use client";
import React, { useState, useEffect } from "react";
import Image, { ImageProps } from "next/image";
import { bhima_boy_Image } from "@/app/Api/api_list";

interface FallbackImageProps extends Omit<ImageProps, "src" | "onError"> {
    src?: string | any;
    fallbackSrc?: string | any;
}

const FallbackImage: React.FC<FallbackImageProps> = ({
    src,
    fallbackSrc,
    alt = "",
    ...props
}) => {
    const [imgSrc, setImgSrc] = useState<any>(src || fallbackSrc || bhima_boy_Image);

    // Update image source if props change
    useEffect(() => {
        setImgSrc(src || fallbackSrc || bhima_boy_Image);
    }, [src, fallbackSrc]);

    return (
        <Image
            {...props}
            src={imgSrc}
            alt={alt}
            onError={() => {
                // If the primary src failed and we have a fallback, try fallback
                if (imgSrc === src && fallbackSrc && fallbackSrc !== src) {
                    setImgSrc(fallbackSrc);
                }
                // If fallback also failed or we didn't have one, use the default global image
                else if (imgSrc !== bhima_boy_Image) {
                    setImgSrc(bhima_boy_Image);
                }
            }}
        />
    );
};

export default FallbackImage;
