import type { ComponentProps } from "react"

interface ToggleButtonProps extends Omit<
  ComponentProps<"button">,
  "onChange" | "value" | "role"
> {
  role: "radio" | "checkbox"
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
  "aria-label"?: string
  componentName: "Radio" | "Checkbox"
}

export function ToggleButton({
  role,
  checked,
  onChange,
  disabled = false,
  "aria-label": ariaLabel,
  componentName,
  className,
  children,
  ...props
}: ToggleButtonProps) {
  if (process.env.NODE_ENV !== "production") {
    if (!ariaLabel)
      console.warn(
        `[${componentName}] aria-label을 전달하세요. 스크린리더 접근성에 필요합니다.`,
      )
  }

  return (
    <button
      type="button"
      role={role}
      aria-checked={checked}
      aria-label={ariaLabel}
      aria-disabled={disabled || undefined}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={className}
      {...props}
    >
      {children}
    </button>
  )
}
