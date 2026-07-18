import FilterDropDownIcon from "@/shared/assets/icon/chevron/FilterDropDownIcon"
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
import { APPLICANT_COLUMNS } from "./applicantTableColumns"
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
  expanded: boolean
  onToggle: () => void
}

export function ApplicantRow({
  row,
  stage,
  expanded,
  onToggle,
}: ApplicantRowProps) {
  const evaluation = getStageEvaluation(row, stage)
  if (!evaluation) return null

  const timeAt = stage === "interview" ? row.interviewAt : row.appliedAt
  const timestamp = timeAt ? formatAppliedAtParts(timeAt) : null

  return (
    <div
      role="row"
      className="border-teal-gray-150/60 hover:bg-teal-gray-50 flex h-17 items-center gap-2.5 border-b bg-white pr-5.5 pl-2.5 transition-colors"
    >
      <div className="flex min-w-0 flex-1 items-center">
        {stage !== "final" &&
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
        <span className={APPLICANT_COLUMNS.chapter}>
          <span className="text-body-2-medium text-teal-gray-900 truncate">
            {row.chapter}
          </span>
        </span>
        <span className={APPLICANT_COLUMNS.school}>
          <span className="text-body-2-medium text-teal-gray-900 truncate">
            {row.school}
          </span>
        </span>
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
      <button
        type="button"
        aria-label={expanded ? "지원자 상세 접기" : "지원자 상세 펼치기"}
        aria-expanded={expanded}
        onClick={onToggle}
        className="shadow-inner-neutral-1 flex size-7.5 shrink-0 items-center justify-center rounded-[10px] bg-white"
      >
        <FilterDropDownIcon
          className={cn(
            "text-teal-gray-700 transition-transform",
            expanded && "rotate-180",
          )}
        />
      </button>
    </div>
  )
}
