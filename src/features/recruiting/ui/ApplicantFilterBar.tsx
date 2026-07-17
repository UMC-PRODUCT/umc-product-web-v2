import { Search } from "lucide-react"
import { useState } from "react"

import { CHAPTERS, isChapter } from "@/entities/organization/model/chapters"
import FilterIcon from "@/shared/assets/icon/filter/FilterIcon"
import { SCHOOLS_BY_BRANCH } from "@/shared/config/schools"
import { cn } from "@/shared/lib/utils"
import { PART_TAG_LABEL } from "@/shared/model/domain"
import { FilterDropdown } from "@/shared/ui/FilterDropDown"
import { Checkbox } from "@/shared/ui/input/checkbox/Checkbox"

import {
  type ApplicantListFilters,
  EVALUATION_PROGRESS_LABEL,
} from "../model/applicantListTypes"

const CHAPTER_ALL_VALUE = "all"

const CHAPTER_OPTIONS = [
  { value: CHAPTER_ALL_VALUE, label: "지부 전체" },
  ...CHAPTERS.map((chapter) => ({ value: chapter, label: chapter })),
]

const PART_OPTIONS = (["pm", "design", "web-pe", "mobile-pe"] as const).map(
  (part) => ({ value: part, label: PART_TAG_LABEL[part] }),
)

const PROGRESS_OPTIONS = (["before", "inProgress", "done"] as const).map(
  (progress) => ({
    value: progress,
    label: EVALUATION_PROGRESS_LABEL[progress],
  }),
)

const RESULT_OPTIONS = [
  { value: "pass", label: "합격" },
  { value: "fail", label: "불합격" },
  { value: "pending", label: "대기" },
]

type Option = { value: string; label: string }

function toggleValue(values: string[], value: string) {
  return values.includes(value)
    ? values.filter((v) => v !== value)
    : [...values, value]
}

function buildMultiSelectLabel(selected: string[], options: Option[]) {
  const [first] = selected
  if (first === undefined) return undefined
  const firstLabel =
    options.find((option) => option.value === first)?.label ?? first
  return selected.length === 1
    ? firstLabel
    : `${firstLabel} 외 ${selected.length - 1}`
}

function buildSchoolOptions(filters: ApplicantListFilters): Option[] {
  const selectedChapters =
    filters.chapterTab === CHAPTER_ALL_VALUE
      ? filters.chapters.filter(isChapter)
      : [filters.chapterTab].filter(isChapter)
  const chapters = selectedChapters.length > 0 ? selectedChapters : CHAPTERS

  return chapters.flatMap((chapter) =>
    SCHOOLS_BY_BRANCH[chapter].map((school) => ({
      value: school,
      label: school,
    })),
  )
}

interface ApplicantFilterBarProps {
  filters: ApplicantListFilters
  onFiltersChange: (partial: Partial<ApplicantListFilters>) => void
  resultFilterLabel: string
  className?: string
}

export function ApplicantFilterBar({
  filters,
  onFiltersChange,
  resultFilterLabel,
  className,
}: ApplicantFilterBarProps) {
  const [openKey, setOpenKey] = useState<string | null>(null)
  const schoolOptions = buildSchoolOptions(filters)

  const multiDropdownProps = (
    key: keyof Pick<
      ApplicantListFilters,
      "chapters" | "schools" | "parts" | "progresses" | "results"
    >,
    label: string,
    options: Option[],
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
    selectedLabel: buildMultiSelectLabel(filters[key], options),
    onSelect: (value: string) => {
      const nextValues =
        allValue !== undefined && value === allValue
          ? []
          : toggleValue(filters[key], value)

      if (key === "chapters") {
        onFiltersChange({ chapters: nextValues, schools: [] })
        return
      }
      onFiltersChange({ [key]: nextValues })
    },
  })

  return (
    <div className={cn("flex items-start justify-between gap-4", className)}>
      <div className="shadow-inner-neutral-2 bg-teal-gray-100 flex h-11 w-80 shrink-0 items-center gap-2 rounded-xl px-4">
        <input
          type="text"
          placeholder="지원자 명으로 검색하세요"
          value={filters.search}
          onChange={(e) => onFiltersChange({ search: e.target.value })}
          className="text-body-2-regular text-teal-gray-900 placeholder:text-teal-gray-400 min-w-0 flex-1 bg-transparent outline-none"
        />
        <Search size={24} className="text-teal-gray-400 shrink-0" />
      </div>
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
              CHAPTER_ALL_VALUE,
            )}
          />
          <FilterDropdown
            {...multiDropdownProps("schools", "학교", schoolOptions)}
          />
          <FilterDropdown
            {...multiDropdownProps("parts", "지원 파트", PART_OPTIONS)}
          />
          <FilterDropdown
            {...multiDropdownProps("progresses", "평가 상태", PROGRESS_OPTIONS)}
          />
          <FilterDropdown
            {...multiDropdownProps(
              "results",
              resultFilterLabel,
              RESULT_OPTIONS,
            )}
          />
        </div>
      </div>
    </div>
  )
}
