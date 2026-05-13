import { cva } from "class-variance-authority"

import { cn } from "@/shared/lib/utils"

const statusDotVariants = cva("size-3 shrink-0 rounded-full", {
  variants: {
    value: {
      pass: "bg-success-600",
      fail: "bg-error-600",
      pending: "bg-warning-500",
    },
  },
})

const statusTextVariants = cva("text-label-2-medium whitespace-nowrap", {
  variants: {
    value: {
      pass: "text-success-600",
      fail: "text-error-600",
      pending: "text-warning-600",
    },
    disabled: {
      true: "",
      false: "",
    },
  },
  compoundVariants: [
    { value: "pending", disabled: true, className: "text-warning-500" },
  ],
})

const STATUS_LABEL = {
  pass: "합격",
  fail: "불합격",
  pending: "대기",
} as const

type StatusValue = keyof typeof STATUS_LABEL

interface StatusChipTagProps {
  value: StatusValue
  type?: "chip" | "tag"
  disabled?: boolean
  className?: string
}

export function StatusChipTag({
  value,
  type = "chip",
  disabled = false,
  className,
}: StatusChipTagProps) {
  if (type === "tag") {
    return (
      <span className={cn("inline-flex h-6 items-center gap-1.5", className)}>
        <span className={statusDotVariants({ value })} />
        <span className={statusTextVariants({ value })}>
          {STATUS_LABEL[value]}
        </span>
      </span>
    )
  }

  return (
    <span
      className={cn(
        "shadow-drop-neutral-2 inline-flex h-6.5 items-center gap-1.5 rounded-xl py-0.5 pr-2.75 pl-2.25",
        !disabled && "border-teal-gray-100 border bg-white",
        className,
      )}
    >
      <span className={statusDotVariants({ value })} />
      <span className={statusTextVariants({ value, disabled })}>
        {STATUS_LABEL[value]}
      </span>
    </span>
  )
}
