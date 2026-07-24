import { useState } from "react"

import {
  type Chapter,
  CHAPTERS,
  isChapter,
} from "@/entities/organization/model/chapters"
import FilterIcon from "@/shared/assets/icon/filter/FilterIcon"
import { SCHOOLS_BY_BRANCH } from "@/shared/config/schools"
import { cn } from "@/shared/lib/utils"
import { PART_TAG_LABEL } from "@/shared/model/domain"
import {
  FilterDropdown,
  type FilterDropdownOption,
} from "@/shared/ui/FilterDropDown"
import { Checkbox } from "@/shared/ui/input/checkbox/Checkbox"
import { SearchField } from "@/shared/ui/search-field/SearchField"

import {
  EVALUATION_HISTORY_CHAPTER_TAB_ALL,
  EVALUATION_RESULT_LABEL,
} from "../../model/evaluationHistory"
import { DownloadButton } from "./DownloadButton"

import type { EvaluationHistoryFilters } from "../../model/evaluationHistory"

const CHAPTER_OPTIONS = [
  { value: EVALUATION_HISTORY_CHAPTER_TAB_ALL, label: "지부 전체" },
  ...CHAPTERS.map((chapter) => ({ value: chapter, label: chapter })),
]

const PART_OPTIONS = (["pm", "design", "web-pe", "mobile-pe"] as const).map(
  (part) => ({ value: part, label: PART_TAG_LABEL[part] }),
)

const RESULT_OPTIONS = (["pass", "fail"] as const).map((result) => ({
  value: result,
  label: EVALUATION_RESULT_LABEL[result],
}))

// 지부를 하나도 안 골랐으면 전체 지부의 학교를 다 유효한 것으로 취급한다.
function schoolsForChapters(chapters: Chapter[]): string[] {
  const scope = chapters.length > 0 ? chapters : CHAPTERS
  return scope.flatMap((chapter) => SCHOOLS_BY_BRANCH[chapter])
}

function buildSchoolOptions(
  filters: EvaluationHistoryFilters,
  chapterScope?: Chapter,
): FilterDropdownOption[] {
  if (chapterScope) {
    return SCHOOLS_BY_BRANCH[chapterScope].map((school) => ({
      value: school,
      label: school,
    }))
  }

  const selectedChapters =
    filters.chapterTab === EVALUATION_HISTORY_CHAPTER_TAB_ALL
      ? filters.chapters.filter(isChapter)
      : [filters.chapterTab].filter(isChapter)

  return schoolsForChapters(selectedChapters).map((school) => ({
    value: school,
    label: school,
  }))
}

interface EvaluationHistoryFilterBarProps {
  filters: EvaluationHistoryFilters
  onFiltersChange: (partial: Partial<EvaluationHistoryFilters>) => void
  chapterScope?: Chapter
  onDownload?: () => void
  downloadDisabled?: boolean
  downloadLoading?: boolean
  className?: string
}

export function EvaluationHistoryFilterBar({
  filters,
  onFiltersChange,
  chapterScope,
  onDownload,
  downloadDisabled = false,
  downloadLoading = false,
  className,
}: EvaluationHistoryFilterBarProps) {
  const [openKey, setOpenKey] = useState<string | null>(null)
  const schoolOptions = buildSchoolOptions(filters, chapterScope)

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
        // 지부를 바꾸면, 이미 골라둔 학교 중 새 지부 목록에 없는 학교만 해제한다.
        // (지부 선택 자체는 그대로 유지)
        const validSchools = new Set(
          schoolsForChapters(nextValues.filter(isChapter)),
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
          <FilterDropdown
            {...multiDropdownProps(
              "chapters",
              "지부",
              CHAPTER_OPTIONS,
              EVALUATION_HISTORY_CHAPTER_TAB_ALL,
            )}
          />
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
