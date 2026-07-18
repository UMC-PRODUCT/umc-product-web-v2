import { cn } from "@/shared/lib/utils"
import { PartTagChip } from "@/shared/ui/chip/PartTagChip"
import { StatusChipTag } from "@/shared/ui/chip/StatusChipTag"
import { CounterLabel } from "@/shared/ui/CounterLabel"
import { TimestampLabel } from "@/shared/ui/TimestampLabel"

import {
  type ApplicantRow as ApplicantRowModel,
  formatAppliedAtParts,
  formatRecruitmentType,
  getStageEvaluation,
} from "../model/applicantListTypes"
import {
  APPLICANT_COLUMNS,
  type ApplicantColumnOptions,
  getVisibleApplicantColumns,
} from "./applicantTableColumns"
import { EvaluationStatusChip } from "./EvaluationStatusChip"

import type { EvaluationStage } from "../model/evaluationStage"

const STAGE_TIME_LABEL: Record<EvaluationStage, string> = {
  document: "지원",
  interview: "면접",
  final: "지원",
}

interface ApplicantRowProps {
  row: ApplicantRowModel
  stage: EvaluationStage
  columns?: ApplicantColumnOptions
}

export function ApplicantRow({ row, stage, columns }: ApplicantRowProps) {
  const evaluation = getStageEvaluation(row, stage)
  if (!evaluation) return null

  const visibleColumns = new Set(getVisibleApplicantColumns(stage, columns))
  const timeAt = stage === "interview" ? row.interviewAt : row.appliedAt
  const timestamp = timeAt ? formatAppliedAtParts(timeAt) : null

  return (
    <div
      role="row"
      className="border-teal-gray-150/60 hover:bg-teal-gray-50 flex h-17 items-center border-b bg-white pr-5.5 pl-2.5 transition-colors"
    >
      <div className="flex min-w-0 flex-1 items-center">
        {visibleColumns.has("appliedAt") &&
          (timestamp ? (
            <TimestampLabel
              date={timestamp.date}
              time={timestamp.time}
              action={STAGE_TIME_LABEL[stage]}
              className={APPLICANT_COLUMNS.appliedAt}
            />
          ) : (
            <span
              className={cn(
                "text-body-2-regular text-teal-gray-900",
                APPLICANT_COLUMNS.appliedAt,
              )}
            >
              -
            </span>
          ))}
        <span className={APPLICANT_COLUMNS.applicant}>
          <span className="text-body-2-medium text-teal-gray-900 truncate">
            {row.applicantName}
          </span>
        </span>
        {visibleColumns.has("chapter") && (
          <span className={APPLICANT_COLUMNS.chapter}>
            <span className="text-body-2-medium text-teal-gray-900 truncate">
              {row.chapter}
            </span>
          </span>
        )}
        {visibleColumns.has("school") && (
          <span className={APPLICANT_COLUMNS.school}>
            <span className="text-body-2-medium text-teal-gray-900 truncate">
              {row.school}
            </span>
          </span>
        )}
        <span
          className={cn(
            "text-body-2-medium text-teal-gray-900 whitespace-nowrap",
            APPLICANT_COLUMNS.type,
          )}
        >
          {formatRecruitmentType(row)}
        </span>
        <span className={APPLICANT_COLUMNS.parts}>
          {row.parts.map((part) => (
            <PartTagChip key={part} role={part} type="light" />
          ))}
        </span>
        {visibleColumns.has("myEvaluation") && (
          <span className={APPLICANT_COLUMNS.myEvaluation}>
            <EvaluationStatusChip progress={evaluation.myProgress} />
          </span>
        )}
        <span className={APPLICANT_COLUMNS.progress}>
          <EvaluationStatusChip progress={evaluation.progress} />
          {stage !== "final" && (
            <CounterLabel
              current={evaluation.doneCount}
              total={evaluation.totalCount}
              emphasis="current"
            />
          )}
        </span>
        <span className={APPLICANT_COLUMNS.result}>
          {evaluation.result && (
            <StatusChipTag type="tag" value={evaluation.result} />
          )}
        </span>
      </div>
    </div>
  )
}
