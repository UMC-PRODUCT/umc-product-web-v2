import { cn } from "@/shared/lib/utils"
import { ExpandableTableHead } from "@/shared/ui/table/ExpandableTableHead"

import {
  APPLICANT_COLUMNS,
  type ApplicantColumnKey,
} from "./applicantTableColumns"

import type { EvaluationStage } from "../model/evaluationStage"

function buildHeadLabels(
  stage: EvaluationStage,
): { key: ApplicantColumnKey; label: string }[] {
  const labels: { key: ApplicantColumnKey; label: string }[] = []
  if (stage !== "final") {
    labels.push({
      key: "appliedAt",
      label: stage === "interview" ? "면접 일시" : "지원 일시",
    })
  }
  labels.push(
    { key: "applicant", label: "지원자" },
    { key: "chapter", label: "지부" },
    { key: "school", label: "학교" },
    { key: "type", label: "유형" },
    { key: "parts", label: "지원 파트" },
    { key: "progress", label: "평가 상태" },
    { key: "result", label: stage === "final" ? "최종 결과" : "평가 결과" },
  )
  return labels
}

interface ApplicantTableHeadProps {
  stage: EvaluationStage
  hasExpanded?: boolean
  onToggleAll?: () => void
  className?: string
}

export function ApplicantTableHead({
  stage,
  hasExpanded = false,
  onToggleAll,
  className,
}: ApplicantTableHeadProps) {
  const headLabels = buildHeadLabels(stage)

  return (
    <ExpandableTableHead
      expanded={hasExpanded}
      onToggle={onToggleAll}
      className={cn("gap-2.5", className)}
    >
      <div className="flex min-w-0 flex-1 items-center">
        {headLabels.map(({ key, label }) => (
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
