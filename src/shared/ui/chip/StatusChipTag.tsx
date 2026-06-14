import { cn } from "@/shared/lib/utils"

const DOT_COLOR: Record<string, Record<string, string>> = {
  pass: { abled: "bg-success-600", disabled: "bg-success-500" },
  fail: { abled: "bg-error-600", disabled: "bg-error-400" },
  pending: { abled: "bg-warning-500", disabled: "bg-warning-500" },
}

const TEXT_COLOR: Record<string, Record<string, string>> = {
  pass: { abled: "text-success-600", disabled: "text-success-500" },
  fail: { abled: "text-error-600", disabled: "text-error-500" },
  pending: { abled: "text-warning-600", disabled: "text-warning-500" },
}

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
  const state = disabled ? "disabled" : "abled"

  if (type === "tag") {
    return (
      <span className={cn("inline-flex h-6 items-center gap-1.5", className)}>
        <span
          className={cn(
            "size-3 shrink-0 rounded-full",
            DOT_COLOR[value]?.abled,
          )}
        />
        <span
          className={cn(
            "text-label-2-medium whitespace-nowrap",
            TEXT_COLOR[value]?.abled,
          )}
        >
          {STATUS_LABEL[value]}
        </span>
      </span>
    )
  }

  return (
    <span
      className={cn(
        "inline-flex h-6.5 items-center gap-1.5 rounded-xl py-0.5 pr-2.75 pl-2.25",
        "drop-shadow-[0px_4px_8px_rgba(239,240,240,0.52)]",
        !disabled && "border-teal-gray-100 border bg-white",
        className,
      )}
    >
      <span
        className={cn(
          "size-3 shrink-0 rounded-full",
          DOT_COLOR[value]?.[state],
        )}
      />
      <span
        className={cn(
          "text-label-2-medium whitespace-nowrap",
          TEXT_COLOR[value]?.[state],
        )}
      >
        {STATUS_LABEL[value]}
      </span>
    </span>
  )
}
