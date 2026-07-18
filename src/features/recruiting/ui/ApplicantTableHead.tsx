import { cn } from "@/shared/lib/utils"
import { ExpandableTableHead } from "@/shared/ui/table/ExpandableTableHead"

import {
  APPLICANT_COLUMNS,
  type ApplicantColumnKey,
  type ApplicantColumnOptions,
  getVisibleApplicantColumns,
} from "./applicantTableColumns"

import type { EvaluationStage } from "../model/evaluationStage"

function columnLabel(key: ApplicantColumnKey, stage: EvaluationStage) {
  if (key === "appliedAt") {
    return stage === "interview" ? "면접 일시" : "지원 일시"
  }
  if (key === "result") {
    return stage === "final" ? "최종 결과" : "평가 결과"
  }
  const labels: Record<
    Exclude<ApplicantColumnKey, "appliedAt" | "result">,
    string
  > = {
    applicant: "지원자",
    chapter: "지부",
    school: "학교",
    type: "유형",
    parts: "지원 파트",
    myEvaluation: "내 담당 평가",
    progress: "평가 상태",
  }
  return labels[key]
}

interface ApplicantTableHeadProps {
  stage: EvaluationStage
  columns?: ApplicantColumnOptions
  hasExpanded?: boolean
  onToggleAll?: () => void
  className?: string
}

export function ApplicantTableHead({
  stage,
  columns,
  hasExpanded = false,
  onToggleAll,
  className,
}: ApplicantTableHeadProps) {
  const visibleColumns = getVisibleApplicantColumns(stage, columns)

  return (
    <ExpandableTableHead
      expanded={hasExpanded}
      onToggle={onToggleAll}
      className={cn("gap-2.5", className)}
    >
      <div className="flex min-w-0 flex-1 items-center">
        {visibleColumns.map((key) => (
          <span
            key={key}
            role="columnheader"
            className={cn(
              "text-body-2-medium whitespace-nowrap text-teal-900",
              APPLICANT_COLUMNS[key],
              key === "parts" && "justify-center",
            )}
          >
            {columnLabel(key, stage)}
          </span>
        ))}
      </div>
    </ExpandableTableHead>
  )
}
