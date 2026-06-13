import { cva, type VariantProps } from "class-variance-authority"
import { type ComponentPropsWithoutRef } from "react"

import CheckIcon from "@/shared/assets/icon/check/CheckIcon"
import { cn } from "@/shared/lib/utils"

import { useOptionButtonGroupContext } from "./context"

const optionButtonVariants = cva(
  "inline-flex shrink-0 items-center border font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-teal-400 disabled:cursor-not-allowed",
  {
    variants: {
      selected: {
        true: "border-teal-400 bg-teal-50 text-teal-600",
        false:
          "border-teal-gray-300 bg-white text-teal-gray-900 hover:bg-teal-gray-50",
      },
      size: {
        m: "h-10 gap-1 rounded-[8px] px-4 text-body-2-medium",
        s: "h-9 gap-1 rounded-[8px] px-3 text-body-2-medium",
        sm: "text-label-2-medium h-7 gap-2.5 rounded-[6px] py-1 pr-2.5 pl-1.5",
      },
    },
    compoundVariants: [
      {
        selected: false,
        class:
          "disabled:border-teal-gray-150 disabled:text-teal-gray-400 disabled:bg-white disabled:hover:bg-white",
      },
      {
        selected: true,
        class:
          "disabled:border-teal-gray-150 disabled:bg-white disabled:text-teal-gray-400",
      },
      {
        selected: true,
        size: "sm",
        class: "border-teal-200 bg-teal-100 text-teal-500",
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

  const isSelected = isInGroup
    ? Array.isArray(group.value)
      ? group.value.includes(value ?? "")
      : group.value === value
    : (selectedProp ?? false)

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (isInGroup && value !== undefined) {
      group.onSelect(value)
    }
    onClick?.(e)
  }

  if (isSegmented && _segmentedInfo) {
    const { isFirst, isLast, showLeft, showRight } = _segmentedInfo
    const isSm = size === "sm"

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

    const baseSize = isSm
      ? "text-label-2-medium h-7 gap-2.5"
      : "text-body-2-medium h-9.5 gap-2.5"

    const selectedClass = isSm
      ? "border border-teal-200 bg-teal-100 py-1 pr-2.5 pl-1.5 text-teal-500 disabled:border-teal-gray-150 disabled:bg-white disabled:text-teal-gray-400"
      : "border border-teal-200 bg-teal-100 pr-5 pl-3 text-teal-600 disabled:border-teal-gray-150 disabled:bg-white disabled:text-teal-gray-400"

    const unselectedPadding = isSm ? "px-2.5" : "px-5"

    return (
      <button
        type="button"
        role="radio"
        aria-checked={isSelected}
        className={cn(
          "inline-flex items-center justify-center font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-teal-400 disabled:cursor-not-allowed",
          baseSize,
          radiusClass,
          isSelected
            ? selectedClass
            : cn(
                "border-teal-gray-200 text-teal-gray-900 hover:bg-teal-gray-50 disabled:border-teal-gray-150 disabled:text-teal-gray-400 border-t border-b bg-white disabled:bg-white disabled:hover:bg-white",
                unselectedPadding,
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
