import { cn } from "@/shared/lib/utils"

import { RadioIndicator } from "./RadioIndicator"

import type { ComponentProps } from "react"

interface RadioListProps extends Omit<ComponentProps<"button">, "onChange"> {
  checked: boolean
  onChange: (checked: boolean) => void
  size?: "lg" | "md"
}

export function RadioList({
  checked,
  onChange,
  size = "lg",
  children,
  className,
  ...props
}: RadioListProps) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn(
        "inline-flex items-center gap-3 rounded-[8px] p-2 transition-colors",
        checked ? "bg-teal-50" : "hover:bg-teal-gray-50 bg-white",
        className,
      )}
      {...props}
    >
      <RadioIndicator checked={checked} variant="list" />
      <span
        className={cn(
          size === "md" ? "text-body-2-medium" : "text-body-1-regular",
          checked ? "text-teal-600" : "text-teal-gray-700",
        )}
      >
        {children}
      </span>
    </button>
  )
}
