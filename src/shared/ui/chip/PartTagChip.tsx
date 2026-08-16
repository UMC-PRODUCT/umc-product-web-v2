import { cva } from "class-variance-authority"

import { cn } from "@/shared/lib/utils"
import { PART_TAG_LABEL } from "@/shared/model/domain"

import type { PartTag } from "@/shared/model/domain"

const partTagChipVariants = cva(
  "inline-flex h-6.5 px-2 items-center justify-center rounded-[6px] py-0.5 text-label-2-medium text-teal-gray-800 shadow-drop-neutral-2",
  {
    variants: {
      role: {
        plan: "",
        design: "",
        web: "",
        ios: "",
        android: "",
        springboot: "",
        nodejs: "",
        pm: "",
        "mobile-pe": "",
        "web-pe": "",
      },
      type: {
        default: "",
        light: "",
      },
    },
    compoundVariants: [
      { role: "plan", type: "default", className: "bg-chip-plan-300" },
      { role: "design", type: "default", className: "bg-chip-design-300" },
      { role: "web", type: "default", className: "bg-chip-web-300" },
      { role: "ios", type: "default", className: "bg-chip-ios-300" },
      { role: "android", type: "default", className: "bg-chip-android-300" },
      {
        role: "springboot",
        type: "default",
        className: "bg-chip-springboot-300",
      },
      { role: "nodejs", type: "default", className: "bg-chip-nodejs-300" },
      { role: "plan", type: "light", className: "bg-chip-plan-100" },
      { role: "design", type: "light", className: "bg-chip-design-100" },
      { role: "web", type: "light", className: "bg-chip-web-100" },
      { role: "ios", type: "light", className: "bg-chip-ios-100" },
      { role: "android", type: "light", className: "bg-chip-android-100" },
      {
        role: "springboot",
        type: "light",
        className: "bg-chip-springboot-100",
      },
      { role: "nodejs", type: "light", className: "bg-chip-nodejs-100" },
      { role: "pm", type: "default", className: "bg-chip-pm-300" },
      {
        role: "mobile-pe",
        type: "default",
        className: "bg-chip-mobile-pe-300",
      },
      { role: "web-pe", type: "default", className: "bg-chip-web-pe-300" },
      { role: "pm", type: "light", className: "bg-chip-pm-100" },
      { role: "mobile-pe", type: "light", className: "bg-chip-mobile-pe-100" },
      { role: "web-pe", type: "light", className: "bg-chip-web-pe-100" },
    ],
    defaultVariants: {
      type: "default",
    },
  },
)

interface PartTagChipProps {
  role: PartTag
  type?: "default" | "light"
  className?: string
}

export function PartTagChip({
  role,
  type = "default",
  className,
}: PartTagChipProps) {
  return (
    <span className={cn(partTagChipVariants({ role, type }), className)}>
      {PART_TAG_LABEL[role]}
    </span>
  )
}
