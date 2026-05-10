import { cn } from "@/shared/lib/utils"

export type CheckboxIndicatorVariant = "gray" | "primary" | "issue" | "list"
export type CheckboxSize = "default" | "lg"

interface CheckboxIndicatorProps {
  checked: boolean
  variant?: CheckboxIndicatorVariant
  size?: CheckboxSize
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

const sizeClass: Record<CheckboxSize, string> = {
  default: "size-5",
  lg: "size-6",
}

const checkmarkSize: Record<
  CheckboxSize,
  { width: number; height: number; strokeWidth: number }
> = {
  default: { width: 12, height: 9, strokeWidth: 1.8 },
  lg: { width: 12, height: 8.4, strokeWidth: 2 },
}

export function CheckboxIndicator({
  checked,
  variant = "gray",
  size = "default",
  disabled = false,
  className,
}: CheckboxIndicatorProps) {
  const isDisabled = disabled || variant === "gray"
  const showCheck = checked && variant !== "gray"
  const { width, height, strokeWidth } = checkmarkSize[size]

  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-[6px]",
        sizeClass[size],
        getBoxClass(variant, checked, isDisabled),
        className,
      )}
    >
      {showCheck && (
        <svg
          width={width}
          height={height}
          viewBox="0 0 12 9"
          fill="none"
          className="shrink-0"
        >
          <path
            d="M0.898438 4.12921L4.39844 7.89844L10.8984 0.898438"
            stroke="white"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </span>
  )
}
