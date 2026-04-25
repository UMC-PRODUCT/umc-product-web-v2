import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/shared/lib/utils"

import type { HTMLAttributes } from "react"

const numberTagStyles = cva(
  "flex items-center justify-center w-3.5 h-3.5 rounded bg-teal-gray-100 text-teal-gray-600 text-center text-caption-3-medium shadow-inner-neutral-3 shadow-inner-neutral-1 leading-none",
  {
    variants: {
      variant: {
        default: "opacity-100",
        dimmed: "opacity-10",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
)

export interface NumberTagProps
  extends HTMLAttributes<HTMLDivElement>, VariantProps<typeof numberTagStyles> {
  value?: number | string
}

export function NumberTag({
  variant,
  value = 1,
  className,
  ...props
}: NumberTagProps) {
  return (
    <div className={cn(numberTagStyles({ variant }), className)} {...props}>
      {value}
    </div>
  )
}
