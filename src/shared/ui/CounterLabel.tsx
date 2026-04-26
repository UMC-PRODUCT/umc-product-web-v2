import { cva } from "class-variance-authority"

import { cn } from "@/shared/lib/utils"

const textVariants = cva("text-teal-gray-500", {
  variants: {
    size: {
      xs: "min-w-2 text-center text-caption-2-regular",
      sm: "min-w-[9px] text-center text-body-2-medium",
      md: "min-w-2.5 text-right text-body-1-medium",
    },
  },
  defaultVariants: {
    size: "md",
  },
})

interface CounterLabelProps {
  current: number
  total: number
  size?: "xs" | "sm" | "md"
  className?: string
}

export function CounterLabel({
  current,
  total,
  size = "md",
  className,
}: CounterLabelProps) {
  return (
    <span
      className={cn(
        "text-teal-gray-500 inline-flex items-center gap-0.5",
        className,
      )}
    >
      <span className={textVariants({ size })}>{current}</span>
      <span className={textVariants({ size })}>/</span>
      <span className={textVariants({ size })}>{total}</span>
    </span>
  )
}
