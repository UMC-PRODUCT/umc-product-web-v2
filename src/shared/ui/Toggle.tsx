import { cva } from "class-variance-authority"

import { cn } from "@/shared/lib/utils"

import type { ComponentProps } from "react"

const toggleTrackVariants = cva(
  "shadow-inner-neutral-2 flex items-center rounded-full p-0.5 transition-colors",
  {
    variants: {
      size: {
        sm: "h-5 w-9",
        md: "h-6 w-11",
      },
      checked: {
        true: "",
        false: "",
      },
      disabled: {
        true: "cursor-not-allowed",
        false: "",
      },
    },
    compoundVariants: [
      { checked: true, disabled: true, className: "bg-teal-200" },
      { checked: false, disabled: true, className: "bg-teal-gray-150" },
      { checked: true, disabled: false, className: "bg-teal-400" },
      { checked: false, disabled: false, className: "bg-teal-gray-300" },
    ],
    defaultVariants: {
      size: "md",
    },
  },
)

const toggleThumbVariants = cva(
  "shrink-0 rounded-full bg-white transition-transform duration-200",
  {
    variants: {
      size: {
        sm: "size-4",
        md: "size-5",
      },
      checked: {
        true: "",
        false: "translate-x-0",
      },
    },
    compoundVariants: [
      { size: "sm", checked: true, className: "translate-x-4" },
      { size: "md", checked: true, className: "translate-x-5" },
    ],
    defaultVariants: {
      size: "md",
    },
  },
)

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
  disabled = false,
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
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        toggleTrackVariants({ size, checked, disabled: disabled ?? false }),
        className,
      )}
      {...props}
    >
      <span
        aria-hidden="true"
        className={toggleThumbVariants({ size, checked })}
      />
    </button>
  )
}
