import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import SvgPersonButtonIcon from "@/assets/icon/people/PersonButtonIcon"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center rounded-[12px] text-label-1-medium transition-colors disabled:pointer-events-none",
  {
    variants: {
      variant: {
        fill: "",
        weak: "",
      },
      color: {
        brand: "",
        neutral: "",
      },
      size: {
        m: "h-11 w-[90px] px-4 py-1",
        s: "h-10 w-[68px] px-5 py-1",
        icon: "h-11 w-14 p-0",
      },
    },
    compoundVariants: [
      {
        variant: "fill",
        color: "brand",
        className:
          "bg-teal-600 text-white hover:bg-teal-700 disabled:bg-teal-300 disabled:text-teal-gray-50",
      },
      {
        variant: "weak",
        color: "brand",
        className:
          "bg-teal-100 text-teal-600 hover:bg-teal-200 disabled:bg-teal-100 disabled:text-teal-300",
      },
      {
        variant: "fill",
        color: "neutral",
        className:
          "bg-teal-gray-600 text-white hover:bg-teal-gray-700 disabled:bg-teal-gray-300 disabled:text-teal-gray-50",
      },
      {
        variant: "weak",
        color: "neutral",
        className:
          "bg-teal-gray-150 text-teal-gray-600 hover:bg-teal-gray-200 disabled:bg-teal-gray-100 disabled:text-teal-gray-300",
      },
    ],
    defaultVariants: {
      variant: "fill",
      color: "brand",
      size: "m",
    },
  },
)

interface ButtonProps
  extends
    Omit<React.ComponentProps<"button">, "color">,
    VariantProps<typeof buttonVariants> {
  loading?: boolean
  asChild?: boolean
}

export function Button({
  className,
  variant,
  color,
  size,
  loading = false,
  asChild = false,
  disabled,
  children,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      type="button"
      disabled={disabled || loading}
      className={cn(buttonVariants({ variant, color, size }), className)}
      {...props}
    >
      {loading ? (
        <span className="flex items-center gap-1.25" aria-hidden="true">
          <span className="animation-duration-[1000ms] h-2 w-2 animate-pulse rounded-full bg-current opacity-100" />
          <span className="animation-duration-[1000ms] h-2 w-2 animate-pulse rounded-full bg-current opacity-60 [animation-delay:75ms]" />
          <span className="animation-duration-[1000ms] h-2 w-2 animate-pulse rounded-full bg-current opacity-20 [animation-delay:150ms]" />
        </span>
      ) : size === "icon" ? (
        <SvgPersonButtonIcon />
      ) : (
        children
      )}
    </Comp>
  )
}
