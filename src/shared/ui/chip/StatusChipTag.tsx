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
  },
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
        "border-teal-gray-100 shadow-drop-neutral-2 inline-flex h-[26px] items-center gap-1.5 rounded-xl border bg-white py-0.5 pr-[11px] pl-[9px]",
        disabled && "border-transparent opacity-60",
        className,
      )}
    >
      <span className={statusDotVariants({ value })} />
      <span className={statusTextVariants({ value })}>
        {STATUS_LABEL[value]}
      </span>
    </span>
  )
}
