import { cva } from "class-variance-authority"

import { cn } from "@/shared/lib/utils"

const partTagChipVariants = cva(
  "inline-flex h-6 px-2.5 items-center justify-center rounded-[6px] py-0.5 text-label-2-medium text-teal-gray-800 shadow-drop-neutral-2",
  {
    variants: {
      role: {
        plan: "w-9",
        design: "w-15",
        web: "w-11.5",
        ios: "w-10",
        android: "w-16.5",
        springboot: "w-22",
        nodejs: "w-16.5",
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
    ],
    defaultVariants: {
      type: "default",
    },
  },
)

const ROLE_LABEL = {
  plan: "PM",
  design: "Design",
  web: "Web",
  ios: "iOS",
  android: "Android",
  springboot: "SpringBoot",
  nodejs: "Node.js",
} as const

type Role = keyof typeof ROLE_LABEL

interface PartTagChipProps {
  role: Role
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
      {ROLE_LABEL[role]}
    </span>
  )
}
