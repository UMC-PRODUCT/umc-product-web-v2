import { cn } from "@/shared/lib/utils"

import type { ComponentProps } from "react"

interface CheckboxListProps extends Omit<ComponentProps<"button">, "onChange"> {
  checked: boolean
  onChange: (checked: boolean) => void
}

export function CheckboxList({
  checked,
  onChange,
  children,
  className,
  ...props
}: CheckboxListProps) {
  return (
    <button
      type="button"
      role="checkbox"
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
          "inline-flex size-5 shrink-0 items-center justify-center rounded-[6px]",
          checked
            ? "bg-teal-500"
            : "border-teal-gray-300 border-[1.5px] bg-white",
        )}
      >
        {checked && (
          <svg width={12} height={9} viewBox="0 0 12 9" fill="none">
            <path
              d="M0.898438 4.12921L4.39844 7.89844L10.8984 0.898438"
              stroke="white"
              strokeWidth={1.8}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
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
