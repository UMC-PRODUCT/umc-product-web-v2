import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/shared/lib/utils"

import type { HTMLAttributes, ReactNode } from "react"

const tagVariants = cva(
  "inline-flex h-6 items-center gap-1.5 text-label-2-medium",
  {
    variants: {
      tone: {
        teal: "text-teal-600",
        gray: "text-teal-gray-600",
        orange: "text-warning-500",
        red: "text-error-500",
      },
    },
    defaultVariants: {
      tone: "teal",
    },
  },
)

const tagDotVariants = cva("size-3 shrink-0 rounded-full", {
  variants: {
    tone: {
      teal: "bg-teal-600",
      gray: "bg-teal-gray-600",
      orange: "bg-warning-500",
      red: "bg-error-500",
    },
  },
  defaultVariants: {
    tone: "teal",
  },
})

export type TagTone = NonNullable<VariantProps<typeof tagVariants>["tone"]>

export interface TagProps
  extends HTMLAttributes<HTMLSpanElement>, VariantProps<typeof tagVariants> {
  children: ReactNode
}

export function Tag({
  tone = "teal",
  children,
  className,
  ...props
}: TagProps) {
  return (
    <span className={cn(tagVariants({ tone }), className)} {...props}>
      <span aria-hidden className={tagDotVariants({ tone })} />
      <span className="whitespace-nowrap">{children}</span>
    </span>
  )
}
