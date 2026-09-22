


type HeadingLargeType = {
  label: string
}
export default function HeadingLarge({ label }: HeadingLargeType) {
  return <h5 className=" font-lora text-4xl font-normal ">{label}</h5>
}

type HeadingMediumBoldType = {
  label: string
  textDirection?: string
}
export function HeadingMediumBold({
  label,
  textDirection,
}: HeadingMediumBoldType) {
  return (
    <h1
      className={`text-xl font-rubik font-normal ${
        textDirection === "center"
          ? "text-center"
          : textDirection === "right"
          ? "text-right"
          : " text-left"
      } text-gray-800 `}
    >
      {label}
    </h1>
  )
}

type HeadingMediumType = {
  label: string
  textDirection?: string
}
export function HeadingMedium({ label, textDirection }: HeadingMediumType) {
  return (
    <h1
      className={`text-xl font-lora font-medium    ${
        textDirection === "center"
          ? "text-center"
          : textDirection === "right"
          ? "text-right"
          : " text-left"
      }`}
    >
      {label}
    </h1>
  )
}

type HeadingSmallNormalType = {
  label: string
  textDirection?: string
}
export function HeadingSmallNormal({
  label,
  textDirection,
}: HeadingSmallNormalType) {
  return (
    <h5
      className={`font-sans font-normal text-black ${
        textDirection === "center"
          ? "text-center"
          : textDirection === "right"
          ? "text-right"
          : " text-left"
      }`}
    >
      {label}
    </h5>
  )
}

type LabelMediumBoldType = {
  label: string
  textDirection?: string
}
export function LabelMediumBold({ label, textDirection }: LabelMediumBoldType) {
  return (
    <h5
      className={`Work Sans font-bold sm:text-sm ${
        textDirection === "center"
          ? "text-center"
          : textDirection === "right"
          ? "text-right"
          : " text-left"
      } text-gray-900`}
    >
      {label}
    </h5>
  )
}

type LabelMediumNormalType = {
  label: string
  textDirection?: string
}
export function LabelMediumNormal({
  label,
  textDirection,
}: LabelMediumNormalType) {
  return (
    <h5
      className={` Work Sans font-medium  text-base sm:text-sm ${
        textDirection === "center"
          ? "text-center"
          : textDirection === "right"
          ? "text-right"
          : " text-left"
      } text-gray-800`}
    >
      {label}
    </h5>
  )
}

type LabelMediumWeightType = {
  label: string
  textDirection?: string
}
export function LabelMediumWeight({
  label,
  textDirection,
}: LabelMediumWeightType) {
  return (
    <h5
      className={`font-rubik text-base font-normal ${
        textDirection === "center"
          ? "text-center"
          : textDirection === "right"
          ? "text-right"
          : " text-left"
      } text-gray-800`}
    >
      {label}
    </h5>
  )
}

type LabelExtraSmallBoldType = {
  label: string
  textDirection?: string
  color?: string
}
export function LabelExtraSmallBold({
  label,
  textDirection,
  color = "text-black",
}: LabelExtraSmallBoldType) {
  return (
    <h5
      className={`font-rubik text-xs font-semibold ${
        textDirection === "center"
          ? "text-center"
          : textDirection === "right"
          ? "text-right"
          : " text-left"
      } ${color}`}
    >
      {label}
    </h5>
  )
}

type LabelSmallBoldType = {
  label: string
  textDirection?: string
  color?: string
}
export function LabelSmallBold({
  label,
  textDirection,
  color = "text-black",
}: LabelSmallBoldType) {
  return (
    <h5
      className={`font-rubik text-sm font-normal ${
        textDirection === "center"
          ? "text-center"
          : textDirection === "right"
          ? "text-right"
          : " text-left"
      } ${color}`}
    >
      {label}
    </h5>
  )
}

type HeadingXtraLargeResponsiveType = {
  label: string
  textDirection?: string
  color?: string
}
export function HeadingXtraLargeResponsive({
  label,
  textDirection,
  color = "text-black",
}: HeadingXtraLargeResponsiveType) {
  return (
    <h5
      className={`text-xl lg:text-5xl
      md:text-3xl sm:text-xl leading-10 text-ui-fg-base text-left font-serif font-light ${
        textDirection === "center"
          ? "text-center"
          : textDirection === "right"
          ? "text-right"
          : " text-left"
      } ${color}`}
    >
      {label}
    </h5>
  )
}

type Heading_58px_500_lora_ResponsiveType = {
  label: string
  textDirection?: string
  color?: string
}
export function Heading_58px_500_lora_Responsive({
  label,
  textDirection,
  color = "text-gray-800",
}: Heading_58px_500_lora_ResponsiveType) {
  return (
    <h5
      className={`text-xl lg:text-5xl
      md:text-[42px]         sm:text-xl leading-10 text-ui-fg-base text-left font-serif font-medium ${
        textDirection === "center"
          ? "text-center"
          : textDirection === "right"
          ? "text-right"
          : " text-left"
      } ${color}`}
    >
      {label}
    </h5>
  )
}

type Font_9pxType = {
  label: string
  textDirection?: string
  color?: string
  fontWeight?: string
  fontFamily?: string
  lineHeight?: string
}
export function Font_9px({
  label,
  textDirection,
  color = "text-black",
  fontWeight = "font-medium",
  fontFamily = "font-serif",
  lineHeight,
}: Font_9pxType) {
  return (
    <h5
      className={`text-[9px] ${
        textDirection === "center"
          ? "text-center"
          : textDirection === "right"
          ? "text-right"
          : " text-left"
      } ${color} ${fontWeight} ${fontFamily} ${lineHeight}`}
    >
      {label}
    </h5>
  )
}

type Font_10pxType = {
  label: string
  textDirection?: string
  color?: string
  fontWeight?: string
  fontFamily?: string
  lineHeight?: string
}
export function Font_10px({
  label,
  textDirection,
  color = "text-black",
  fontWeight = "font-medium",
  fontFamily = "font-serif",
  lineHeight,
}: Font_10pxType) {
  return (
    <h5
      className={`text-[10px] ${
        textDirection === "center"
          ? "text-center"
          : textDirection === "right"
          ? "text-right"
          : " text-left"
      } ${color} ${fontWeight} ${fontFamily} ${lineHeight}`}
    >
      {label}
    </h5>
  )
}

type Font_12pxType = {
  label: string
  textDirection?: string
  color?: string
  fontWeight?: string
  fontFamily?: string
  lineHeight?: string
}
export function Font_12px({
  label,
  textDirection,
  color = "text-black",
  fontWeight = "font-medium",
  fontFamily = "font-serif",
  lineHeight,
}: Font_12pxType) {
  return (
    <h5
      className={`text-xs ${
        textDirection === "center"
          ? "text-center"
          : textDirection === "right"
          ? "text-right"
          : " text-left"
      } ${color} ${fontWeight} ${fontFamily} ${lineHeight}`}
    >
      {label}
    </h5>
  )
}

type Font_16pxType = {
  label: string
  textDirection?: string
  color?: string
  fontWeight?: string
  fontFamily?: string
  lineHeight?: string
}
export function Font_16px({
  label,
  textDirection,
  color = "text-black",
  fontWeight = "font-medium",
  fontFamily = "Work Sans",
  lineHeight,
}: Font_16pxType) {
  return (
    <h5
      className={`text-base ${
        textDirection === "center"
          ? "text-center"
          : textDirection === "right"
          ? "text-right"
          : " text-end"
      } ${color} ${fontWeight} ${fontFamily} ${lineHeight}`}
    >
      {label}
    </h5>
  )
}

type Font_18pxType = {
  label: string
  textDirection?: string
  color?: string
  fontWeight?: string
  fontFamily?: string
}
export function Font_18px({
  label,
  textDirection,
  color = "text-black",
  fontWeight = "font-medium",
  fontFamily = "font-serif",
}: Font_18pxType) {
  return (
    <h5
      className={`text-lg ${
        textDirection === "center"
          ? "text-center"
          : textDirection === "right"
          ? "text-right"
          : " text-left"
      } ${color} ${fontWeight} ${fontFamily}`}
    >
      {label}
    </h5>
  )
}

type Font_14pxType = {
  label: string
  textDirection?: string
  color?: string
  fontWeight?: string
  fontFamily?: string
}
export function Font_14px({
  label,
  textDirection,
  color = "text-black",
  fontWeight = "font-medium",
  fontFamily = "font-serif",
}: Font_14pxType) {
  return (
    <h5
      className={`text-sm md:text-sm ${
        textDirection === "center"
          ? "text-center"
          : textDirection === "right"
          ? "text-right"
          : " text-left"
      } ${color} ${fontWeight} ${fontFamily}`}
    >
      {label}
    </h5>
  )
}

type Font_24pxType = {
  label: string
  textDirection?: string
  color?: string
  fontWeight?: string
  fontFamily?: string
}
export function Font_24px({
  label,
  textDirection,
  color = "text-black",
  fontWeight = "font-medium",
  fontFamily = "font-serif",
}: Font_24pxType) {
  return (
    <h5
      className={`text-xl sm:text-lg lg:text-2xl  ${
        textDirection === "center"
          ? "text-center"
          : textDirection === "right"
          ? "text-right"
          : " text-left"
      } ${color} ${fontWeight} ${fontFamily}`}
    >
      {label}
    </h5>
  )
}

type Font_20pxType = {
  label: string
  textDirection?: string
  color?: string
  fontWeight?: string
  fontFamily?: string
}
export function Font_20px({
  label,
  textDirection,
  color = "text-black",
  fontWeight = "font-medium",
  fontFamily = "Work Sans",
}: Font_20pxType) {
  return (
    <h5
      className={`text-xl ${
        textDirection === "center"
          ? "text-center"
          : textDirection === "right"
          ? "text-right"
          : " text-left"
      } ${color} ${fontWeight} ${fontFamily}`}
    >
      {label}
    </h5>
  )
}

type Font_36px_Type = {
  label: string
  textDirection?: string
  color?: string
  fontWeight?: string
  fontFamily?: string
  lineHeight?: string
}
export function Font_36px({
  label,
  textDirection,
  color = "text-black",
  fontWeight = "font-medium",
  fontFamily = "font-serif",
  lineHeight,
}: Font_36px_Type) {
  return (
    <h5
      className={`text-xl lg:text-4xl
      md:text-2xl sm:text-xl ${
        textDirection === "center"
          ? "text-center"
          : textDirection === "right"
          ? "text-right"
          : " text-left"
      } ${color} ${fontWeight} ${fontFamily} ${lineHeight} `}
    >
      {label}
    </h5>
  )
}
