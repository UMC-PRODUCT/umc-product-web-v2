import { cva, type VariantProps } from "class-variance-authority"
import { type ComponentPropsWithoutRef } from "react"

import CheckIcon from "@/shared/assets/icon/check/CheckIcon"
import { cn } from "@/shared/lib/utils"

import { useOptionButtonGroupContext } from "./context"

const optionButtonVariants = cva(
  "inline-flex shrink-0 items-center gap-1 rounded-[8px] border font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-teal-400 disabled:cursor-not-allowed text-body-2-medium",
  {
    variants: {
      selected: {
        true: "border-teal-400 bg-teal-50 text-teal-600",
        false:
          "border-teal-gray-300 bg-white text-teal-gray-900 hover:bg-teal-gray-50",
      },
      size: {
        m: "h-10 px-4",
        s: "h-9 px-3",
      },
    },
    compoundVariants: [
      {
        selected: false,
        class:
          "disabled:border-teal-gray-200 disabled:text-teal-gray-300 disabled:bg-white disabled:hover:bg-white",
      },
      {
        selected: true,
        class:
          "disabled:border-teal-200 disabled:text-teal-300 disabled:bg-teal-50",
      },
    ],
    defaultVariants: { size: "m", selected: false },
  },
)

export interface SegmentedPositionInfo {
  isFirst: boolean
  isLast: boolean
  showLeft: boolean
  showRight: boolean
}

interface OptionButtonProps extends Omit<
  ComponentPropsWithoutRef<"button">,
  "value"
> {
  value?: string
  selected?: boolean
  size?: VariantProps<typeof optionButtonVariants>["size"]
  showCheck?: boolean
  _segmentedInfo?: SegmentedPositionInfo
}

export function OptionButton({
  value,
  selected: selectedProp,
  size = "m",
  showCheck = true,
  _segmentedInfo,
  className,
  children,
  onClick,
  ...props
}: OptionButtonProps) {
  const group = useOptionButtonGroupContext()
  const isInGroup = group !== null
  const isSegmented = group?.variant === "segmented"

  const isSelected = isInGroup ? group.value === value : (selectedProp ?? false)

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (isInGroup && value !== undefined) {
      group.onSelect(value)
    }
    onClick?.(e)
  }

  if (isSegmented && _segmentedInfo) {
    const { isFirst, isLast, showLeft, showRight } = _segmentedInfo

    const radiusClass =
      isFirst && isLast
        ? isSelected
          ? "rounded-[6px]"
          : "rounded-[8px]"
        : isFirst
          ? isSelected
            ? "rounded-l-[6px] rounded-r-none"
            : "rounded-l-[8px] rounded-r-none"
          : isLast
            ? isSelected
              ? "rounded-r-[6px] rounded-l-none"
              : "rounded-r-[8px] rounded-l-none"
            : "rounded-none"

    return (
      <button
        type="button"
        role="radio"
        aria-checked={isSelected}
        className={cn(
          "text-body-2-medium inline-flex h-9.5 items-center justify-center gap-0.5 font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-teal-400 disabled:cursor-not-allowed",
          radiusClass,
          isSelected
            ? "border border-teal-200 bg-teal-100 pr-2.5 pl-1.5 text-teal-500 disabled:border-teal-200 disabled:bg-teal-50 disabled:text-teal-300"
            : cn(
                "border-teal-gray-200 text-teal-gray-700 hover:bg-teal-gray-50 disabled:border-teal-gray-200 disabled:text-teal-gray-300 border-t border-b px-3 disabled:hover:bg-transparent",
                showLeft && "border-l",
                showRight && "border-r",
              ),
          className,
        )}
        onClick={handleClick}
        {...props}
      >
        {showCheck && isSelected && (
          <CheckIcon width={16} height={16} aria-hidden="true" />
        )}
        {children}
      </button>
    )
  }

  const ariaProps = isInGroup
    ? { role: "radio" as const, "aria-checked": isSelected }
    : { "aria-pressed": isSelected }

  return (
    <button
      type="button"
      {...ariaProps}
      className={cn(
        optionButtonVariants({ selected: isSelected, size }),
        className,
      )}
      onClick={handleClick}
      {...props}
    >
      {showCheck && isSelected && (
        <CheckIcon width={16} height={16} aria-hidden="true" />
      )}
      {children}
    </button>
  )
}
