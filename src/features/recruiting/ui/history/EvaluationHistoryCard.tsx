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
  // 이미 정렬/그룹 순서가 적용된 채로 전달된다(archive.tsx의 orderEvaluationHistoryRows).
  // CSV 다운로드와 화면이 같은 순서를 보게 하려고 정렬은 상위에서 담당한다.
  rows: EvaluationHistoryEntry[]
  baseTime: string
  progress: EvaluationHistoryProgress
  sort: EvaluationHistorySort
  onSortChange: (sort: EvaluationHistorySort) => void
  byEvaluator: boolean
  onByEvaluatorChange: (checked: boolean) => void
  className?: string
}

export function EvaluationHistoryCard({
  rows,
  baseTime,
  progress,
  sort,
  onSortChange,
  byEvaluator,
  onByEvaluatorChange,
  className,
}: EvaluationHistoryCardProps) {
  const [sortOpen, setSortOpen] = useState(false)

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
              onChange={onByEvaluatorChange}
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
              onSortChange(value === "oldest" ? "oldest" : "latest")
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

      <EvaluationHistoryTable rows={rows} className="mt-8" />
    </section>
  )
}
