import { cn } from "@/shared/lib/utils"

import { ToggleButton } from "../ToggleButton"
import { CheckboxIndicator } from "./CheckboxIndicator"

import type { ComponentProps } from "react"

type CheckboxVariant = "gray" | "primary" | "issue"

interface CheckboxProps extends Omit<
  ComponentProps<"button">,
  "onChange" | "value" | "role"
> {
  checked: boolean
  onChange: (checked: boolean) => void
  variant?: CheckboxVariant
  disabled?: boolean
  "aria-label"?: string
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

  return (
    <ToggleButton
      role="checkbox"
      componentName="Checkbox"
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
      <CheckboxIndicator
        checked={checked}
        variant={variant}
        disabled={disabled}
      />
    </ToggleButton>
  )
}
