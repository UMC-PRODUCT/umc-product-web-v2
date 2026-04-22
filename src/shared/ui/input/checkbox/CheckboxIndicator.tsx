import { cn } from "@/shared/lib/utils"

export type CheckboxIndicatorVariant = "gray" | "primary" | "issue" | "list"

interface CheckboxIndicatorProps {
  checked: boolean
  variant?: CheckboxIndicatorVariant
  disabled?: boolean
  className?: string
}

function getBoxClass(
  variant: CheckboxIndicatorVariant,
  checked: boolean,
  isDisabled: boolean,
): string {
  if (!checked) {
    if (variant === "gray" || variant === "list") {
      return "border-[1.5px] border-teal-gray-300 bg-white"
    }
    if (variant === "primary") {
      return cn(
        "border-[1.5px] border-teal-400 bg-white",
        isDisabled && "opacity-50",
      )
    }
    return cn(
      "border-[1.5px] border-error-500 bg-white",
      isDisabled && "opacity-50",
    )
  }

  if (variant === "issue") return "bg-error-300"
  if (variant === "primary") return isDisabled ? "bg-teal-200" : "bg-teal-500"
  if (variant === "list") return "bg-teal-500"
  return "border-[1.5px] border-teal-gray-300 bg-white"
}

export function CheckboxIndicator({
  checked,
  variant = "gray",
  disabled = false,
  className,
}: CheckboxIndicatorProps) {
  const isDisabled = disabled || variant === "gray"
  const showCheck = checked && variant !== "gray"

  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-flex size-5 shrink-0 items-center justify-center rounded-[6px]",
        getBoxClass(variant, checked, isDisabled),
        className,
      )}
    >
      {showCheck && (
        <svg width={12} height={9} viewBox="0 0 12 9" fill="none">
          <path
            d="M0.898438 4.12921L4.39844 7.89844L10.8984 0.898438"
            stroke="white"
            strokeWidth={1.8}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </span>
  )
}
