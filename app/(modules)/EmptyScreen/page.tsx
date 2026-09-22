import { bhima_boy_Image } from "@/app/Api/api_list";
import GradientBasicButton from "@/app/components/button/page";
import { Font_14px } from "@/app/components/labels/page";

import Image from "next/image";
import Link from "next/link";

export default function BhimaEmptyScreenTemplete({
  message,
}: any) {
  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="w-[80vw] h-[80vh] flex flex-col justify-center items-center">
        <Image
          src={bhima_boy_Image}
          alt={"Bhima Boy Image"}
          width={76}
          height={125}
        />
        <div className="my-4">
          <Font_14px
            label={message || ""}
            fontFamily="font-rubik"
            color="text-gray-800"
            fontWeight="font-medium"
          />
        </div>
        <Link href={"/"} className="my-3">
          <GradientBasicButton label={"Browse Home"} />
        </Link>
      </div>
    </div>
  );
}