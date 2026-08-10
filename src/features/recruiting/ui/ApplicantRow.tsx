import { useNavigate } from "@tanstack/react-router"

import { cn } from "@/shared/lib/utils"
import { PartTagChip } from "@/shared/ui/chip/PartTagChip"
import { StatusChipTag } from "@/shared/ui/chip/StatusChipTag"
import { TimestampLabel } from "@/shared/ui/timestamp/TimestampLabel"

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
  interview: "지원",
  final: "지원",
}

interface ApplicantRowProps {
  row: ApplicantRowModel
  stage: EvaluationStage
  columns?: ApplicantColumnOptions
}

export function ApplicantRow({ row, stage, columns }: ApplicantRowProps) {
  const navigate = useNavigate()
  const evaluation = getStageEvaluation(row, stage)
  if (!evaluation) return null

  const visibleColumns = new Set(getVisibleApplicantColumns(stage, columns))
  const timestamp = row.appliedAt ? formatAppliedAtParts(row.appliedAt) : null
  const navigable = stage === "document" || stage === "interview"

  const openDetail = () => {
    const params = { applicationId: row.applicationId }
    const search = { roundId: row.roundId }
    if (stage === "document") {
      navigate({
        to: "/recruiting/evaluations/document/$applicationId",
        params,
        search,
      })
    } else if (stage === "interview") {
      navigate({
        to: "/recruiting/evaluations/interview/$applicationId",
        params,
        search,
      })
    }
  }

  return (
    <div
      role="row"
      tabIndex={navigable ? 0 : undefined}
      onClick={navigable ? openDetail : undefined}
      onKeyDown={
        navigable
          ? (event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault()
                openDetail()
              }
            }
          : undefined
      }
      className={cn(
        "border-teal-gray-150/60 hover:bg-teal-gray-50 flex h-17 items-center border-b bg-white pr-5.5 pl-2.5 transition-colors",
        navigable &&
          "focus-visible:bg-teal-gray-50 cursor-pointer outline-none",
      )}
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
