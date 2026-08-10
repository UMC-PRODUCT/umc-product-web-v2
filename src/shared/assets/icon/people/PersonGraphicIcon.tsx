import personGraphic from "./person-graphic.png"

import type { ImgHTMLAttributes } from "react"

// 색을 바꿔야 하면 피그마에서 새로 export
const PersonGraphicIcon = ({
  width = 30,
  height = 30,
  alt = "",
  ...props
}: ImgHTMLAttributes<HTMLImageElement>) => (
  <img src={personGraphic} width={width} height={height} alt={alt} {...props} />
)

export default PersonGraphicIcon
