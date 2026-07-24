import { useState } from "react"

import { cn } from "@/shared/lib/utils"
import { FilterDropdown } from "@/shared/ui/FilterDropDown"
import { Checkbox } from "@/shared/ui/input/checkbox/Checkbox"
import { Tag, type TagTone } from "@/shared/ui/tag/Tag"

import {
  EVALUATION_HISTORY_PROGRESS_LABEL,
  EVALUATION_HISTORY_SORT_OPTIONS,
  type EvaluationHistoryEntry,
  type EvaluationHistoryProgress,
  type EvaluationHistorySort,
  groupEvaluationHistoryByEvaluator,
  groupEvaluationHistoryBySchool,
  sortEvaluationHistory,
} from "../../model/evaluationHistory"
import { EvaluationHistoryTable } from "./EvaluationHistoryTable"

const EVALUATION_HISTORY_PROGRESS_TONE: Record<
  EvaluationHistoryProgress,
  TagTone
> = {
  before: "gray",
  inProgress: "orange",
  done: "teal",
}

interface EvaluationHistoryCardProps {
  rows: EvaluationHistoryEntry[]
  baseTime: string
  progress: EvaluationHistoryProgress
  bySchool: boolean
  className?: string
}

export function EvaluationHistoryCard({
  rows,
  baseTime,
  progress,
  bySchool,
  className,
}: EvaluationHistoryCardProps) {
  const [sort, setSort] = useState<EvaluationHistorySort>("latest")
  const [byEvaluator, setByEvaluator] = useState(false)
  const [sortOpen, setSortOpen] = useState(false)

  // "담당자별"/"학교별" 둘 다 별도 헤더 행 없이, 그룹 단위로 뭉쳐서 행 순서만 바꾼다.
  // 담당자별이 켜져 있으면 그게 우선이고, 아니면 학교별을 본다.
  const visibleRows = byEvaluator
    ? groupEvaluationHistoryByEvaluator(rows, sort).flatMap(
        (group) => group.rows,
      )
    : bySchool
      ? groupEvaluationHistoryBySchool(rows).flatMap((group) =>
          sortEvaluationHistory(group.rows, sort),
        )
      : sortEvaluationHistory(rows, sort)

  return (
    <section
      className={cn(
        "shadow-drop-neutral-3 flex w-full flex-col rounded-[20px] bg-white px-8 py-7",
        className,
      )}
    >
      <div className="flex h-10 items-center justify-between">
        <h3 className="text-heading-6-semibold text-teal-gray-700">
          최종 평가 이력
        </h3>
        <div className="flex items-center gap-4">
          <label className="flex cursor-pointer items-center gap-2">
            <Checkbox
              checked={byEvaluator}
              onChange={setByEvaluator}
              variant="primary"
              aria-label="담당자별 보기"
            />
            <span className="text-body-1-medium text-teal-gray-600">
              담당자별
            </span>
          </label>
          <FilterDropdown
            label="최신 순"
            multiSelect={false}
            className="border-teal-gray-300 text-teal-gray-900 hover:bg-teal-gray-50 h-10 bg-white"
            open={sortOpen}
            onClick={() => setSortOpen((prev) => !prev)}
            onRequestClose={() => setSortOpen(false)}
            options={EVALUATION_HISTORY_SORT_OPTIONS}
            selectedValue={sort}
            selectedLabel={
              EVALUATION_HISTORY_SORT_OPTIONS.find(
                (option) => option.value === sort,
              )?.label
            }
            onSelect={(value) =>
              setSort(value === "oldest" ? "oldest" : "latest")
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
          총 {rows.length.toLocaleString()}명
        </span>
        <Tag tone={EVALUATION_HISTORY_PROGRESS_TONE[progress]} className="ml-1">
          {EVALUATION_HISTORY_PROGRESS_LABEL[progress]}
        </Tag>
      </div>

      <EvaluationHistoryTable rows={visibleRows} className="mt-8" />
    </section>
  )
}
