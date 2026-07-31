import { useState } from "react"

import FilterIcon from "@/shared/assets/icon/filter/FilterIcon"
import { cn } from "@/shared/lib/utils"
import { PART_TAG_LABEL } from "@/shared/model/domain"
import {
  FilterDropdown,
  type FilterDropdownOption,
} from "@/shared/ui/FilterDropDown"
import { Checkbox } from "@/shared/ui/input/checkbox/Checkbox"
import { SearchField } from "@/shared/ui/search-field/SearchField"

import {
  buildHistoryChapterOptions,
  buildHistorySchoolOptions,
  EVALUATION_HISTORY_CHAPTER_TAB_ALL,
  EVALUATION_RESULT_LABEL,
} from "../../model/evaluationHistory"
import { DownloadButton } from "./DownloadButton"

import type {
  EvaluationHistoryEntry,
  EvaluationHistoryFilters,
} from "../../model/evaluationHistory"

const PART_OPTIONS = (["pm", "design", "web-pe", "mobile-pe"] as const).map(
  (part) => ({ value: part, label: PART_TAG_LABEL[part] }),
)

const RESULT_OPTIONS = (["pass", "fail"] as const).map((result) => ({
  value: result,
  label: EVALUATION_RESULT_LABEL[result],
}))

interface EvaluationHistoryFilterBarProps {
  filters: EvaluationHistoryFilters
  onFiltersChange: (partial: Partial<EvaluationHistoryFilters>) => void
  // 지부·학교 선택지를 실제 조회 결과에서 만든다. 상수로 만들면 서버가 주는
  // 정식 명칭과 값이 어긋나 필터가 아무것도 못 걸러낸다.
  rows: EvaluationHistoryEntry[]
  chapterScope?: string
  onDownload?: () => void
  downloadDisabled?: boolean
  downloadLoading?: boolean
  className?: string
}

export function EvaluationHistoryFilterBar({
  filters,
  onFiltersChange,
  rows,
  chapterScope,
  onDownload,
  downloadDisabled = false,
  downloadLoading = false,
  className,
}: EvaluationHistoryFilterBarProps) {
  const [openKey, setOpenKey] = useState<string | null>(null)
  const chapterOptions = [
    { value: EVALUATION_HISTORY_CHAPTER_TAB_ALL, label: "지부 전체" },
    ...buildHistoryChapterOptions(rows),
  ]
  // 지부 탭으로 좁혀졌으면 그 지부만, 아니면 드롭다운에서 고른 지부를 기준으로 한다.
  const schoolScope = chapterScope ? [chapterScope] : filters.chapters
  const schoolOptions = buildHistorySchoolOptions(rows, schoolScope)

  const multiDropdownProps = (
    key: keyof Pick<
      EvaluationHistoryFilters,
      "chapters" | "schools" | "parts" | "results"
    >,
    label: string,
    options: FilterDropdownOption[],
    allValue?: string,
  ) => ({
    multiSelect: true as const,
    label,
    options,
    allValue,
    open: openKey === key,
    onClick: () => setOpenKey((prev) => (prev === key ? null : key)),
    onRequestClose: () => setOpenKey(null),
    selectedValues: filters[key],
    onSelectedValuesChange: (nextValues: string[]) => {
      if (key === "chapters") {
        // 지부를 바꾸면 그 지부에 없는 학교 선택은 버린다.
        // 지부를 바꾸면, 이미 골라둔 학교 중 새 지부 목록에 없는 학교만 해제한다.
        // (지부 선택 자체는 그대로 유지)
        const validSchools = new Set(
          buildHistorySchoolOptions(rows, nextValues).map(
            (option) => option.value,
          ),
        )
        onFiltersChange({
          chapters: nextValues,
          schools: filters.schools.filter((school) => validSchools.has(school)),
        })
        return
      }
      onFiltersChange({ [key]: nextValues })
    },
  })

  return (
    <div className={cn("flex items-start justify-between gap-4", className)}>
      <SearchField
        aria-label="지원자 또는 평가자 검색"
        placeholder="지원자 혹은 평가자 이름으로 검색하세요"
        value={filters.search}
        onChange={(event) => onFiltersChange({ search: event.target.value })}
        className="w-80 shrink-0"
      />
      <div className="flex flex-wrap items-center justify-end gap-4">
        <span className="text-body-1-medium text-teal-gray-600 flex items-center gap-1">
          <FilterIcon className="text-teal-gray-600 size-4" />
          필터
        </span>
        <label className="flex cursor-pointer items-center gap-2">
          <Checkbox
            checked={filters.bySchool}
            onChange={(checked) => onFiltersChange({ bySchool: checked })}
            variant="primary"
            aria-label="학교별 보기"
          />
          <span className="text-body-1-medium text-teal-gray-600">학교별</span>
        </label>
        <div className="flex items-center gap-2">
          {/* "전체" 탭에서만 보인다. 특정 지부 탭(chapterScope)에서는 ChapterTabs 자체가
              스코프를 정하므로 이 드롭다운은 숨긴다(디자인 확정, 2026-07-24). */}
          {!chapterScope && (
            <FilterDropdown
              {...multiDropdownProps(
                "chapters",
                "지부",
                chapterOptions,
                EVALUATION_HISTORY_CHAPTER_TAB_ALL,
              )}
            />
          )}
          <FilterDropdown
            {...multiDropdownProps("schools", "학교", schoolOptions)}
          />
          <FilterDropdown
            {...multiDropdownProps("parts", "지원 파트", PART_OPTIONS)}
          />
          <FilterDropdown
            {...multiDropdownProps("results", "평가 결과", RESULT_OPTIONS)}
          />
        </div>
        <DownloadButton
          onClick={onDownload}
          disabled={downloadDisabled}
          loading={downloadLoading}
        />
      </div>
    </div>
  )
}
