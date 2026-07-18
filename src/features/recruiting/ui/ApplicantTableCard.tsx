import { useMemo, useState } from "react"

import { cn } from "@/shared/lib/utils"
import { FilterDropdown } from "@/shared/ui/FilterDropDown"
import { Checkbox } from "@/shared/ui/input/checkbox/Checkbox"
import { Tag, type TagTone } from "@/shared/ui/tag/Tag"

import {
  APPLICANT_ORDER_OPTIONS,
  APPLICANT_SORT_OPTIONS,
  type ApplicantCardFilters,
  type ApplicantRow as ApplicantRowModel,
  applyCardFilters,
  DEFAULT_APPLICANT_CARD_FILTERS,
  getStageEvaluation,
} from "../model/applicantListTypes"
import { ApplicantRow } from "./ApplicantRow"
import { ApplicantTableHead } from "./ApplicantTableHead"

import type { EvaluationStage } from "../model/evaluationStage"
import type { ApplicantColumnOptions } from "./applicantTableColumns"

type CardStatus =
  | "beforeRecruit"
  | "beforeApply"
  | "evaluating"
  | "evaluated"
  | "delayed"
  | "beforeEval"

const CARD_STATUS_TAG: Record<CardStatus, { tone: TagTone; label: string }> = {
  beforeRecruit: { tone: "gray", label: "모집 전" },
  beforeApply: { tone: "gray", label: "지원 전" },
  evaluating: { tone: "orange", label: "평가 진행중" },
  evaluated: { tone: "teal", label: "평가 완료" },
  delayed: { tone: "red", label: "평가 지연" },
  beforeEval: { tone: "gray", label: "평가 전" },
}

function deriveCardTitle(
  titleBase: string | undefined,
  cardFilters: ApplicantCardFilters,
) {
  if (!titleBase) return "전체 지원자"
  if (cardFilters.includeRegular && !cardFilters.includeAdditional) {
    return `${titleBase} 정규 지원자`
  }
  if (!cardFilters.includeRegular && cardFilters.includeAdditional) {
    return `${titleBase} 추가 지원자`
  }
  return `${titleBase} 전체 지원자`
}

function deriveCardStatus(
  allStageRows: ApplicantRowModel[],
  cardFilters: ApplicantCardFilters,
  stage: EvaluationStage,
  hasRecruitment: boolean,
): CardStatus {
  if (!hasRecruitment) return "beforeRecruit"

  const evaluations = allStageRows.flatMap((row) => {
    if (!cardFilters.includeRegular && row.recruitmentType === "regular") {
      return []
    }
    if (
      !cardFilters.includeAdditional &&
      row.recruitmentType === "additional"
    ) {
      return []
    }
    const evaluation = getStageEvaluation(row, stage)
    return evaluation ? [evaluation] : []
  })

  if (evaluations.length === 0) return "beforeApply"
  if (evaluations.every(({ progress }) => progress === "before")) {
    return "beforeEval"
  }
  const allDone = evaluations.every(({ progress }) => progress === "done")
  return allDone ? "evaluated" : "evaluating"
}

function deriveEmptyMessage(
  cardFilters: ApplicantCardFilters,
  hasRecruitment: boolean,
) {
  const additionalOnly =
    cardFilters.includeAdditional && !cardFilters.includeRegular
  if (!hasRecruitment) {
    return additionalOnly
      ? "현재 추가 모집 중인 공고가 없습니다."
      : "현재 등록된 모집 공고가 없습니다."
  }
  return additionalOnly
    ? "현재 추가 모집 지원자가 없습니다."
    : "현재 지원자가 없습니다."
}

interface ApplicantTableCardProps {
  visibleRows: ApplicantRowModel[]
  allStageRows: ApplicantRowModel[]
  stage: EvaluationStage
  baseTime: string
  titleBase?: string
  columns?: ApplicantColumnOptions
  initialCardFilters?: Partial<ApplicantCardFilters>
  hasRecruitment?: boolean
  className?: string
}

export function ApplicantTableCard({
  visibleRows,
  allStageRows,
  stage,
  baseTime,
  titleBase,
  columns,
  initialCardFilters,
  hasRecruitment = true,
  className,
}: ApplicantTableCardProps) {
  const [cardFilters, setCardFilters] = useState<ApplicantCardFilters>({
    ...DEFAULT_APPLICANT_CARD_FILTERS,
    ...initialCardFilters,
  })
  const [openDropdown, setOpenDropdown] = useState<"sort" | "order" | null>(
    null,
  )

  const rows = useMemo(
    () => applyCardFilters(visibleRows, cardFilters, stage),
    [visibleRows, cardFilters, stage],
  )

  const isEmpty = rows.length === 0
  const statusTag =
    CARD_STATUS_TAG[
      deriveCardStatus(allStageRows, cardFilters, stage, hasRecruitment)
    ]

  const handleCardFiltersChange = (partial: Partial<ApplicantCardFilters>) => {
    setCardFilters((prev) => ({ ...prev, ...partial }))
  }

  return (
    <section
      className={cn(
        "shadow-drop-neutral-3 flex w-full flex-col rounded-[20px] bg-white px-8 py-7",
        className,
      )}
    >
      <div className="flex h-10 items-center justify-between">
        <h3 className="text-heading-6-semibold text-teal-gray-700">
          {deriveCardTitle(titleBase, cardFilters)}
        </h3>
        <div className="flex items-center gap-4">
          <label className="flex cursor-pointer items-center gap-2">
            <Checkbox
              checked={cardFilters.includeRegular}
              onChange={(checked) => {
                if (!checked && !cardFilters.includeAdditional) return
                handleCardFiltersChange({ includeRegular: checked })
              }}
              variant="primary"
              aria-label="정규 모집 포함"
            />
            <span className="text-body-1-medium text-teal-gray-600">
              정규 모집
            </span>
          </label>
          <label className="flex cursor-pointer items-center gap-2">
            <Checkbox
              checked={cardFilters.includeAdditional}
              onChange={(checked) => {
                if (!checked && !cardFilters.includeRegular) return
                handleCardFiltersChange({ includeAdditional: checked })
              }}
              variant="primary"
              aria-label="추가 모집 포함"
            />
            <span className="text-body-1-medium text-teal-gray-600">
              추가 모집
            </span>
          </label>
          <FilterDropdown
            label="최신 순"
            multiSelect={false}
            className="border-teal-gray-300 text-teal-gray-900 hover:bg-teal-gray-50 h-10 bg-white"
            open={openDropdown === "sort"}
            onClick={() =>
              setOpenDropdown((prev) => (prev === "sort" ? null : "sort"))
            }
            onRequestClose={() => setOpenDropdown(null)}
            options={APPLICANT_SORT_OPTIONS}
            selectedValue={cardFilters.sort}
            selectedLabel={
              APPLICANT_SORT_OPTIONS.find(
                (option) => option.value === cardFilters.sort,
              )?.label
            }
            onSelect={(value) =>
              handleCardFiltersChange({
                sort: value === "registered" ? "registered" : "latest",
              })
            }
          />
          <FilterDropdown
            label="순서"
            multiSelect={false}
            className="border-teal-gray-300 text-teal-gray-900 hover:bg-teal-gray-50 h-10 bg-white"
            open={openDropdown === "order"}
            onClick={() =>
              setOpenDropdown((prev) => (prev === "order" ? null : "order"))
            }
            onRequestClose={() => setOpenDropdown(null)}
            options={APPLICANT_ORDER_OPTIONS}
            selectedValue={
              cardFilters.order === "" ? undefined : cardFilters.order
            }
            selectedLabel={
              APPLICANT_ORDER_OPTIONS.find(
                (option) => option.value === cardFilters.order,
              )?.label
            }
            onSelect={(value) =>
              handleCardFiltersChange({
                order:
                  cardFilters.order === value
                    ? ""
                    : (APPLICANT_ORDER_OPTIONS.find(
                        (option) => option.value === value,
                      )?.value ?? ""),
              })
            }
          />
        </div>
      </div>
      <div className="flex items-center gap-2 px-1">
        <span className="text-body-1-regular text-teal-gray-400">
          {baseTime} 기준
        </span>
        <span className="bg-teal-gray-200 h-3 w-px" aria-hidden="true" />
        <span className="text-body-1-regular text-teal-gray-400">
          총 {rows.length.toLocaleString()} 명
        </span>
        <Tag tone={statusTag.tone} className="ml-1">
          {statusTag.label}
        </Tag>
      </div>
      <div role="table" className="mt-8 flex flex-col">
        {isEmpty ? (
          <div className="flex min-h-75 items-center justify-center">
            <p className="text-body-2-regular text-teal-gray-400">
              {deriveEmptyMessage(cardFilters, hasRecruitment)}
            </p>
          </div>
        ) : (
          <>
            <ApplicantTableHead stage={stage} columns={columns} />
            {rows.map((row) => (
              <ApplicantRow
                key={row.applicationId}
                row={row}
                stage={stage}
                columns={columns}
              />
            ))}
          </>
        )}
      </div>
    </section>
  )
}
