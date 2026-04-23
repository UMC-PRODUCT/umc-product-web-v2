import { cn } from "@/shared/lib/utils"

import type { ComponentProps } from "react"

interface ToggleProps extends Omit<
  ComponentProps<"button">,
  "onChange" | "value"
> {
  checked: boolean
  onChange: (checked: boolean) => void
  size?: "sm" | "md"
  "aria-label"?: string
}

export function Toggle({
  checked,
  onChange,
  size = "md",
  className,
  "aria-label": ariaLabel,
  ...props
}: ToggleProps) {
  if (process.env.NODE_ENV !== "production") {
    if (!ariaLabel)
      console.warn(
        "[Toggle] aria-label을 전달하세요. 스크린리더 접근성에 필요합니다.",
      )
  }

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      onClick={() => onChange(!checked)}
      className={cn(
        "shadow-inner-neutral-2 flex items-center rounded-full p-0.5 transition-colors",
        size === "sm" ? "h-5 w-9" : "h-6 w-11",
        checked ? "bg-teal-400" : "bg-teal-gray-300",
        className,
      )}
      {...props}
    >
      <span
        aria-hidden="true"
        className={cn(
          "shrink-0 rounded-full bg-white transition-transform duration-200",
          size === "sm"
            ? cn("size-4", checked ? "translate-x-4" : "translate-x-0")
            : cn("size-5", checked ? "translate-x-5" : "translate-x-0"),
        )}
      />
    </button>
  )
}
