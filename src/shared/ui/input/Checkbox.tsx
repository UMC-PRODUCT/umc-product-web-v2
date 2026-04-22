import { cn } from "@/shared/lib/utils"

import type { ComponentProps } from "react"

type CheckboxVariant = "gray" | "primary" | "issue"

interface CheckboxProps extends Omit<
  ComponentProps<"button">,
  "onChange" | "value"
> {
  checked: boolean
  onChange: (checked: boolean) => void
  variant?: CheckboxVariant
  disabled?: boolean
  "aria-label"?: string
}

function getBoxClass(
  variant: CheckboxVariant,
  checked: boolean,
  disabled: boolean,
): string {
  if (!checked) {
    if (variant === "gray") {
      return "bg-white border-[1.5px] border-teal-gray-300"
    }
    if (variant === "primary") {
      return cn(
        "bg-white border-[1.5px] border-teal-400",
        disabled && "opacity-50",
      )
    }
    return cn(
      "bg-white border-[1.5px] border-error-500",
      disabled && "opacity-50",
    )
  }

  if (variant === "primary") {
    return disabled ? "bg-teal-200" : "bg-teal-500"
  }
  return "bg-error-300"
}

export function Checkbox({
  checked,
  onChange,
  variant = "gray",
  disabled = false,
  className,
  "aria-label": ariaLabel,
  ...props
}: CheckboxProps) {
  const isDisabled = disabled || variant === "gray"

  if (process.env.NODE_ENV !== "production") {
    if (!ariaLabel)
      console.warn(
        "[Checkbox] aria-label을 전달하세요. 스크린리더 접근성에 필요합니다.",
      )
  }

  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={ariaLabel}
      aria-disabled={isDisabled || undefined}
      disabled={isDisabled}
      onClick={() => onChange(!checked)}
      className={cn(
        "inline-flex size-5 items-center justify-center rounded-[6px] transition-colors disabled:cursor-not-allowed",
        getBoxClass(variant, checked, isDisabled),
        className,
      )}
      {...props}
    >
      {checked && (
        <svg
          width={12}
          height={9}
          viewBox="0 0 12 9"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M0.898438 4.12921L4.39844 7.89844L10.8984 0.898438"
            stroke="white"
            strokeWidth={1.8}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </button>
  )
}
