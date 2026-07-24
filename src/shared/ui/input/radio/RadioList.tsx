import { cn } from "@/shared/lib/utils"

import { RadioIndicator } from "./RadioIndicator"

import type { ComponentProps, ReactNode } from "react"

interface RadioListProps extends Omit<ComponentProps<"button">, "onChange"> {
  checked: boolean
  onChange: (checked: boolean) => void
  allowDeselect?: boolean
  trailingIcon?: ReactNode
}

export function RadioList({
  checked,
  onChange,
  children,
  className,
  disabled = false,
  allowDeselect = false,
  trailingIcon,
  ...props
}: RadioListProps) {
  const labelClass = disabled
    ? "text-body-1-regular text-teal-gray-400"
    : checked
      ? "text-body-1-medium text-teal-600"
      : "text-body-1-regular text-teal-gray-700"

  return (
    <button
      type="button"
      role="radio"
      aria-checked={checked}
      aria-disabled={disabled || undefined}
      disabled={disabled}
      onClick={() => {
        if (!checked) {
          onChange(true)
          return
        }
        if (allowDeselect) {
          onChange(false)
        }
      }}
      className={cn(
        "inline-flex items-center gap-3 rounded-[8px] p-2 transition-colors disabled:cursor-not-allowed",
        checked ? "bg-teal-50" : "enabled:hover:bg-teal-gray-50 bg-white",
        className,
      )}
      {...props}
    >
      <RadioIndicator checked={checked} variant="list" disabled={disabled} />
      {trailingIcon ? (
        <span className="flex min-w-0 flex-1 items-center justify-between gap-3">
          <span className={labelClass}>{children}</span>
          <span
            aria-hidden="true"
            className="size-4 shrink-0 [&>svg]:size-full"
          >
            {trailingIcon}
          </span>
        </span>
      ) : (
        <span className={labelClass}>{children}</span>
      )}
    </button>
  )
}
