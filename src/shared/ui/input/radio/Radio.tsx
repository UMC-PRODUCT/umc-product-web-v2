import { cn } from "@/shared/lib/utils"

import { ToggleButton } from "../ToggleButton"
import { RadioIndicator } from "./RadioIndicator"

import type { ComponentProps } from "react"

type RadioVariant = "gray" | "primary"

interface RadioProps extends Omit<
  ComponentProps<"button">,
  "onChange" | "value" | "role"
> {
  checked: boolean
  onChange: (checked: boolean) => void
  variant?: RadioVariant
  disabled?: boolean
  "aria-label"?: string
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

  return (
    <ToggleButton
      role="radio"
      componentName="Radio"
      checked={checked}
      onChange={onChange}
      disabled={isDisabled}
      aria-label={ariaLabel}
      className={cn(
        "inline-flex items-center justify-center transition-colors disabled:cursor-not-allowed",
        className,
      )}
      {...props}
    >
      <RadioIndicator checked={checked} variant={variant} disabled={disabled} />
    </ToggleButton>
  )
}
