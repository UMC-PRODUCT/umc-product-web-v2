import CollapseAllIcon from "@/shared/assets/icon/expand-collapse/CollapseAllIcon"
import ExpandAllIcon from "@/shared/assets/icon/expand-collapse/ExpandAllIcon"
import { cn } from "@/shared/lib/utils"

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
    <div
      role="row"
      className={cn(
        "flex h-10 items-center gap-2.5 rounded-t-xl bg-teal-100 pr-5.5 pl-2.5",
        className,
      )}
    >
      <div className="flex min-w-0 flex-1 items-center" role="rowheader">
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
      <button
        type="button"
        aria-label={hasExpanded ? "모두 접기" : "모두 펼치기"}
        onClick={onToggleAll}
        className="shadow-inner-neutral-2 flex size-6.5 shrink-0 items-center justify-center rounded-lg bg-teal-100 transition-colors hover:bg-teal-200"
      >
        {hasExpanded ? (
          <CollapseAllIcon width={24} height={24} className="text-teal-700" />
        ) : (
          <ExpandAllIcon width={24} height={24} className="text-teal-700" />
        )}
      </button>
    </div>
  )
}
