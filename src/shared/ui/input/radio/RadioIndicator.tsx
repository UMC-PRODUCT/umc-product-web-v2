import { cn } from "@/shared/lib/utils"

export type RadioIndicatorVariant = "gray" | "primary" | "list"

interface RadioIndicatorProps {
  checked: boolean
  variant?: RadioIndicatorVariant
  disabled?: boolean
  className?: string
}

function getRingClass(
  variant: RadioIndicatorVariant,
  checked: boolean,
  isDisabled: boolean,
): string {
  if (!checked) {
    if (variant === "gray" || variant === "list") {
      return cn(
        "border-[1.5px] bg-white",
        isDisabled ? "border-teal-gray-300" : "border-teal-gray-400",
      )
    }
    return "border-[1.5px] border-teal-400 bg-white"
  }

  return cn(
    "border-[1.5px] bg-white",
    isDisabled ? "border-teal-200" : "border-teal-500",
  )
}

function getDotClass(disabled: boolean): string {
  return disabled ? "bg-teal-200" : "bg-teal-500"
}

export function RadioIndicator({
  checked,
  variant = "gray",
  disabled = false,
  className,
}: RadioIndicatorProps) {
  const isDisabled = disabled || variant === "gray"
  const showDot = checked && (variant === "primary" || variant === "list")

  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-flex size-5 shrink-0 items-center justify-center rounded-full",
        getRingClass(variant, checked, isDisabled),
        className,
      )}
    >
      {showDot && (
        <span className={cn("size-3 rounded-full", getDotClass(isDisabled))} />
      )}
    </span>
  )
}
