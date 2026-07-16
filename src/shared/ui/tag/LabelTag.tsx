import { cva, type VariantProps } from "class-variance-authority"

import HamburgerIcon from "@/shared/assets/icon/hamburger/HamburgerIcon"
import { cn } from "@/shared/lib/utils"

import type { HTMLAttributes, ReactNode } from "react"

const labelTagVariants = cva(
  "inline-flex h-6 items-center gap-1 rounded-[6px] px-2 py-0.5 text-label-2-medium shadow-drop-neutral-2",
  {
    variants: {
      tone: {
        teal: "bg-teal-100 text-teal-600",
        gray: "bg-teal-gray-150 text-teal-gray-600",
        purple: "bg-chip-plan-100 text-chip-plan-500",
        brown: "bg-chip-springboot-100 text-chip-springboot-500",
        blue: "bg-chip-ios-100 text-chip-ios-500",
        pink: "bg-chip-design-100 text-chip-design-500",
        yellow: "bg-chip-web-100 text-chip-web-500",
      },
      disabled: {
        true: "opacity-40",
        false: "",
      },
    },
    defaultVariants: {
      tone: "teal",
      disabled: false,
    },
  },
)

export type LabelTagTone = NonNullable<
  VariantProps<typeof labelTagVariants>["tone"]
>

export interface LabelTagProps
  extends
    HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof labelTagVariants> {
  children: ReactNode
  icon?: ReactNode
}

export function LabelTag({
  tone = "teal",
  disabled = false,
  children,
  icon,
  className,
  ...props
}: LabelTagProps) {
  return (
    <span
      className={cn(labelTagVariants({ tone, disabled }), className)}
      {...props}
    >
      {icon ?? <HamburgerIcon aria-hidden className="size-3 shrink-0" />}
      <span className="whitespace-nowrap">{children}</span>
    </span>
  )
}
