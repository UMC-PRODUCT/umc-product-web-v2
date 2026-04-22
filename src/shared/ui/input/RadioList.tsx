import { cn } from "@/shared/lib/utils"

import type { ComponentProps } from "react"

interface RadioListProps extends Omit<ComponentProps<"button">, "onChange"> {
  checked: boolean
  onChange: (checked: boolean) => void
}

export function RadioList({
  checked,
  onChange,
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
      <span
        aria-hidden="true"
        className={cn(
          "inline-flex size-5 shrink-0 items-center justify-center rounded-full border-[1.5px]",
          checked
            ? "border-teal-500 bg-white"
            : "border-teal-gray-400 bg-white",
        )}
      >
        {checked && <span className="size-3 rounded-full bg-teal-500" />}
      </span>
      <span
        className={cn(
          "text-body-2-regular",
          checked ? "text-teal-600" : "text-teal-gray-700",
        )}
      >
        {children}
      </span>
    </button>
  )
}
