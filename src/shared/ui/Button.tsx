import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import LeftChevronIcon from "@/shared/assets/icon/chevron/LeftChevronIcon"
import PlusIcon from "@/shared/assets/icon/plus/PlusIcon"
import { cn } from "@/shared/lib/utils"

const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center rounded-[12px] text-label-1-medium leading-none transition-colors disabled:pointer-events-none",
  {
    variants: {
      variant: {
        fill: "",
        weak: "",
      },
      color: {
        primary: "",
        neutral: "",
        white: "",
      },
      size: {
        m: "h-11 min-w-[90px] px-4",
        s: "h-10 min-w-[74px] px-5",
        xs: "h-[34px] pt-0.5",
      },
    },
    compoundVariants: [
      {
        variant: "fill",
        color: "primary",
        className:
          "bg-teal-600 text-white hover:bg-teal-700 disabled:bg-teal-300 disabled:text-teal-gray-50",
      },
      {
        variant: "weak",
        color: "primary",
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
      {
        variant: "fill",
        color: "white",
        size: "xs",
        className:
          "shadow-inner-neutral-2 bg-teal-gray-50 text-teal-gray-600 hover:bg-teal-gray-100 disabled:bg-teal-gray-50 disabled:text-teal-gray-400",
      },
      {
        variant: "weak",
        color: "white",
        size: "xs",
        className:
          "shadow-inner-neutral-2 bg-transparent text-teal-gray-600 hover:bg-teal-gray-50 disabled:bg-transparent disabled:text-teal-gray-400",
      },
    ],
    defaultVariants: {
      variant: "fill",
      color: "primary",
      size: "m",
    },
  },
)

interface ButtonProps
  extends
    Omit<React.ComponentProps<"button">, "color">,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean
  asChild?: boolean
  icon?: boolean
}

export function Button({
  className,
  variant,
  color,
  size,
  isLoading = false,
  asChild = false,
  icon = false,
  disabled,
  children,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot.Root : "button"

  const leftIcon = (() => {
    if (!icon) return null
    if (size === "xs") {
      const iconColor = cn(
        color === "white" && !disabled && "text-teal-gray-400",
        color === "white" && disabled && "text-teal-gray-300",
      )
      return <LeftChevronIcon width={16} height={16} className={iconColor} />
    }
    const plusIconColor = cn(
      variant === "fill" &&
        color === "primary" &&
        !disabled &&
        "text-white group-hover:text-teal-50",
      variant === "fill" && color === "primary" && disabled && "text-teal-50",
      variant === "weak" && color === "primary" && !disabled && "text-teal-600",
      variant === "weak" && color === "primary" && disabled && "text-teal-300",
    )
    return <PlusIcon width={16} height={16} className={plusIconColor} />
  })()

  return (
    <Comp
      {...(!asChild && { type: "button" })}
      aria-busy={isLoading || undefined}
      disabled={disabled}
      className={cn(
        "group",
        buttonVariants({ variant, color, size }),
        size === "xs" &&
          (icon ? "pr-3.5 pl-2" : "w-14.5 min-w-14.5 rounded-[8px]"),
        size === "m" && !icon && "rounded-[10px]",
        icon && size === "s" && "w-18.5 min-w-18.5 pr-4 pl-2.5",
        icon && size === "m" && "w-19 min-w-19 pr-4 pl-3",
        isLoading && "pointer-events-none cursor-default select-none",
        isLoading && variant === "fill" && color === "primary" && "bg-teal-700",
        isLoading && variant === "weak" && color === "primary" && "bg-teal-200",
        isLoading &&
          variant === "fill" &&
          color === "neutral" &&
          "bg-teal-gray-700",
        isLoading &&
          variant === "weak" &&
          color === "neutral" &&
          "bg-teal-gray-200",
        className,
      )}
      {...props}
    >
      {isLoading ? (
        <>
          <span className="sr-only">로딩 중</span>
          <span className="flex items-center gap-1.25" aria-hidden="true">
            <span className="animation-duration-[1000ms] h-2 w-2 animate-pulse rounded-full bg-current opacity-100" />
            <span className="animation-duration-[1000ms] h-2 w-2 animate-pulse rounded-full bg-current opacity-60 [animation-delay:75ms]" />
            <span className="animation-duration-[1000ms] h-2 w-2 animate-pulse rounded-full bg-current opacity-20 [animation-delay:150ms]" />
          </span>
        </>
      ) : leftIcon ? (
        <span className="flex items-center gap-1 whitespace-nowrap">
          {leftIcon}
          {children}
        </span>
      ) : (
        children
      )}
    </Comp>
  )
}
