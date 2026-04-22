import { cn } from "@/shared/lib/utils"

import type { ComponentProps } from "react"

type RadioVariant = "gray" | "primary"

interface RadioProps extends Omit<
  ComponentProps<"button">,
  "onChange" | "value"
> {
  checked: boolean
  onChange: (checked: boolean) => void
  variant?: RadioVariant
  disabled?: boolean
  "aria-label"?: string
}

function getRingClass(
  variant: RadioVariant,
  checked: boolean,
  isDisabled: boolean,
): string {
  if (!checked) {
    if (variant === "gray") {
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

export function Radio({
  checked,
  onChange,
  variant = "gray",
  disabled = false,
  className,
  "aria-label": ariaLabel,
  ...props
}: RadioProps) {
  const isDisabled = disabled || variant === "gray"

  if (process.env.NODE_ENV !== "production") {
    if (!ariaLabel)
      console.warn(
        "[Radio] aria-label을 전달하세요. 스크린리더 접근성에 필요합니다.",
      )
  }

  return (
    <button
      type="button"
      role="radio"
      aria-checked={checked}
      aria-label={ariaLabel}
      aria-disabled={isDisabled || undefined}
      disabled={isDisabled}
      onClick={() => onChange(!checked)}
      className={cn(
        "inline-flex size-5 items-center justify-center rounded-full transition-colors disabled:cursor-not-allowed",
        getRingClass(variant, checked, isDisabled),
        className,
      )}
      {...props}
    >
      {checked && variant === "primary" && (
        <span
          aria-hidden="true"
          className={cn("size-3 rounded-full", getDotClass(isDisabled))}
        />
      )}
    </button>
  )
}
