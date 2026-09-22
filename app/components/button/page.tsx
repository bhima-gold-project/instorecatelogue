import { Text } from "@medusajs/ui"

type GradientBasicButtonType = {
  label: string
}

export default function GradientBasicButton({
  label,
}: GradientBasicButtonType) {
  return (
    <div className="  bg-[linear-gradient(146deg,_rgba(62,138,255,1)_0%,_rgba(0,212,255,1)_100%)]  flex justify-center w-full items-center">
      <Text className="text-black font-normal font-rubik mx-8	my-2">
        {label}
      </Text>
    </div>
  )
}
