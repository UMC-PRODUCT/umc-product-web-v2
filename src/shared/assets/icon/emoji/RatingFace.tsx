import { cn } from "@/shared/lib/utils"

import RatingFace1Icon from "./RatingFace1Icon"
import RatingFace2Icon from "./RatingFace2Icon"
import RatingFace3Icon from "./RatingFace3Icon"
import RatingFace4Icon from "./RatingFace4Icon"
import RatingFace5Icon from "./RatingFace5Icon"

import type { ComponentType, CSSProperties, SVGProps } from "react"

export type RatingScore = 1 | 2 | 3 | 4 | 5
export type RatingVariant = "filled" | "default" | "neutral"
export type RatingSize = "sm" | "md" | "lg"

type FaceTokens = CSSProperties & Record<"--face-fg" | "--face-bg", string>

const FACE_MAP: Record<RatingScore, ComponentType<SVGProps<SVGSVGElement>>> = {
  1: RatingFace1Icon,
  2: RatingFace2Icon,
  3: RatingFace3Icon,
  4: RatingFace4Icon,
  5: RatingFace5Icon,
}

const VARIANT_TOKENS: Record<RatingVariant, FaceTokens> = {
  filled: {
    "--face-fg": "var(--color-teal-100)",
    "--face-bg": "var(--color-teal-500)",
  },
  default: {
    "--face-fg": "var(--color-teal-600)",
    "--face-bg": "var(--color-teal-200)",
  },
  neutral: {
    "--face-fg": "var(--color-teal-gray-600)",
    "--face-bg": "var(--color-teal-gray-300)",
  },
}

const SIZE_CLASS: Record<RatingSize, string> = {
  sm: "size-[22px]",
  md: "size-8",
  lg: "size-11",
}

export interface RatingFaceProps extends SVGProps<SVGSVGElement> {
  score: RatingScore
  variant?: RatingVariant
  size?: RatingSize
}

export const RatingFace = ({
  score,
  variant = "default",
  size = "md",
  className,
  style,
  ...props
}: RatingFaceProps) => {
  const Face = FACE_MAP[score]
  return (
    <Face
      className={cn(SIZE_CLASS[size], className)}
      style={{ ...VARIANT_TOKENS[variant], ...style }}
      {...props}
    />
  )
}
