import { cn } from "@/shared/lib/utils"
import { ExpandableTableHead } from "@/shared/ui/table/ExpandableTableHead"

export const APPLICANT_COLUMNS = {
  appliedAt: "flex min-w-36 flex-1 items-center justify-center px-4",
  applicant: "flex min-w-27.5 flex-1 items-center px-5",
  chapter: "flex min-w-30 flex-1 items-center px-4",
  school: "flex min-w-30 flex-1 items-center px-4",
  type: "flex min-w-21.5 shrink-0 items-center justify-center px-2.5",
  parts: "flex min-w-50 flex-1 items-center gap-2 px-4",
  progress: "flex min-w-35 flex-1 items-center gap-2.5 px-4",
  result: "flex min-w-22.5 flex-1 items-center px-4",
} as const

const HEAD_LABELS: { key: keyof typeof APPLICANT_COLUMNS; label: string }[] = [
  { key: "appliedAt", label: "지원 일시" },
  { key: "applicant", label: "지원자" },
  { key: "chapter", label: "지부" },
  { key: "school", label: "학교" },
  { key: "type", label: "유형" },
  { key: "parts", label: "지원 파트" },
  { key: "progress", label: "평가 상태" },
  { key: "result", label: "평가 결과" },
]

interface ApplicantTableHeadProps {
  hasExpanded?: boolean
  onToggleAll?: () => void
  className?: string
}

export function ApplicantTableHead({
  hasExpanded = false,
  onToggleAll,
  className,
}: ApplicantTableHeadProps) {
  return (
    <ExpandableTableHead
      expanded={hasExpanded}
      onToggle={onToggleAll}
      className={cn("gap-2.5", className)}
    >
      <div className="flex min-w-0 flex-1 items-center">
        {HEAD_LABELS.map(({ key, label }) => (
          <span
            key={key}
            role="columnheader"
            className={cn(
              "text-body-2-medium whitespace-nowrap text-teal-900",
              APPLICANT_COLUMNS[key],
              key === "parts" && "justify-center",
            )}
          >
            {label}
          </span>
        ))}
      </div>
    </ExpandableTableHead>
  )
}
