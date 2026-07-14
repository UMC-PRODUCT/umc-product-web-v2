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
        true: "border-teal-200 bg-teal-100 text-teal-500",
        false:
          "border-teal-gray-200 bg-white text-teal-gray-700 hover:bg-teal-gray-50",
      },
      size: {
        xl: "h-12 gap-1.5 rounded-[8px] px-7 text-subtitle-1-medium",
        sm: "h-9.5 gap-1.5 rounded-[8px] px-5 text-label-1-medium",
        xs: "h-7 gap-0.5 rounded-[6px] px-3 text-label-2-medium",
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
    ],
    defaultVariants: { size: "sm", selected: false },
  },
)

export interface SegmentedPositionInfo {
  isFirst: boolean
  isLast: boolean
  gapLeft: boolean
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
  size = "sm",
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

  const checkSize = size === "xl" ? 24 : 16

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (isInGroup && value !== undefined) {
      group.onSelect(value)
    }
    onClick?.(e)
  }

  if (isSegmented && _segmentedInfo) {
    const { isFirst, isLast, gapLeft } = _segmentedInfo
    const resolvedSize = size ?? "sm"

    const radiusFull = resolvedSize === "xs" ? "rounded-[6px]" : "rounded-[8px]"
    const radiusLeft =
      resolvedSize === "xs" ? "rounded-l-[6px]" : "rounded-l-[8px]"
    const radiusRight =
      resolvedSize === "xs" ? "rounded-r-[6px]" : "rounded-r-[8px]"
    const radiusClass =
      isFirst && isLast
        ? radiusFull
        : isFirst
          ? radiusLeft
          : isLast
            ? radiusRight
            : "rounded-none"

    const heightClass =
      resolvedSize === "xl" ? "h-12" : resolvedSize === "xs" ? "h-7" : "h-9.5"

    const selectedClass =
      resolvedSize === "xl"
        ? "text-subtitle-1-medium gap-1.5 py-1 pr-7 pl-4.5"
        : resolvedSize === "xs"
          ? "text-label-2-medium gap-0.5 py-1 pr-2.5 pl-1.5"
          : "text-label-1-medium gap-1.5 py-1 pr-5 pl-3"

    const unselectedClass =
      resolvedSize === "xl"
        ? "text-subtitle-1-medium py-1 px-7 font-normal!"
        : resolvedSize === "xs"
          ? "text-body-2-medium py-1 px-3"
          : "text-body-1-regular py-1 px-5"

    return (
      <button
        type="button"
        role="radio"
        aria-checked={isSelected}
        className={cn(
          "inline-flex items-center justify-center transition-colors outline-none focus-visible:ring-2 focus-visible:ring-teal-400 disabled:cursor-not-allowed",
          heightClass,
          radiusClass,
          gapLeft && "ml-px",
          isSelected
            ? cn(
                "disabled:border-teal-gray-150 disabled:text-teal-gray-400 border border-teal-200 bg-teal-100 text-teal-500 disabled:bg-white",
                selectedClass,
              )
            : cn(
                "border-teal-gray-200 text-teal-gray-700 hover:bg-teal-gray-50 disabled:border-teal-gray-150 disabled:text-teal-gray-400 border-t border-b bg-white disabled:bg-white disabled:hover:bg-white",
                unselectedClass,
                isFirst && "border-l",
                isLast && "border-r",
              ),
          className,
        )}
        onClick={handleClick}
        {...props}
      >
        {showCheck && isSelected && (
          <CheckIcon width={checkSize} height={checkSize} aria-hidden="true" />
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
        <CheckIcon width={checkSize} height={checkSize} aria-hidden="true" />
      )}
      {children}
    </button>
  )
}
