import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/shared/lib/utils"

import type { HTMLAttributes } from "react"

const numberTagStyles = cva(
  "flex h-3.5 w-3.5 items-center justify-center rounded bg-teal-gray-100 text-center text-caption-3-medium leading-none text-teal-gray-600 shadow-inner-neutral-3",
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
