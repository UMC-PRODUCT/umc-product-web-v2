import { useMemo, useState } from "react"

import { useSchoolChapterMap } from "@/entities/organization/hooks/useSchoolChapterMap"
import { type Chapter, isChapter } from "@/entities/organization/model/chapters"
import FilterIcon from "@/shared/assets/icon/filter/FilterIcon"
import { SCHOOLS_BY_BRANCH } from "@/shared/config/schools"
import { cn } from "@/shared/lib/utils"
import { PART_TAG_LABEL } from "@/shared/model/domain"
import {
  FilterDropdown,
  type FilterDropdownOption,
} from "@/shared/ui/FilterDropDown"
import { SearchField } from "@/shared/ui/search-field/SearchField"

import {
  type ApplicantListFilters,
  EVALUATION_PROGRESS_LABEL,
} from "../model/applicantListTypes"

const CHAPTER_ALL_VALUE = "all"

const PART_OPTIONS = (["pm", "design", "web-pe", "mobile-pe"] as const).map(
  (part) => ({ value: part, label: PART_TAG_LABEL[part] }),
)

const PROGRESS_OPTIONS = (["inProgress", "done"] as const).map((progress) => ({
  value: progress,
  label: EVALUATION_PROGRESS_LABEL[progress],
}))

const RESULT_OPTIONS = [
  { value: "pass", label: "합격" },
  { value: "fail", label: "불합격" },
]

function buildSchoolOptions(
  filters: ApplicantListFilters,
  serverChapters: Array<{
    chapterName: string
    schools: Array<{ schoolName: string }>
  }>,
  chapterScope?: Chapter,
  isFallbackNeeded = false,
): FilterDropdownOption[] {
  const branchMap = SCHOOLS_BY_BRANCH as Record<string, readonly string[]>

  if (chapterScope) {
    const chapterObj = serverChapters.find(
      (c) => c.chapterName === chapterScope,
    )
    if (chapterObj) {
      return chapterObj.schools.map((s) => ({
        value: s.schoolName,
        label: s.schoolName,
      }))
    }
    if (isFallbackNeeded) {
      const schools = branchMap[chapterScope] ?? []
      return schools.map((school: string) => ({ value: school, label: school }))
    }
    return []
  }

  const selectedChapters =
    filters.chapterTab === CHAPTER_ALL_VALUE
      ? filters.chapters.filter(isChapter)
      : [filters.chapterTab].filter(isChapter)

  const activeChapters =
    selectedChapters.length > 0
      ? serverChapters.filter((c) => selectedChapters.includes(c.chapterName))
      : serverChapters

  const schoolSet = new Set<string>()
  activeChapters.forEach((ch) => {
    ch.schools.forEach((s) => {
      if (s.schoolName) schoolSet.add(s.schoolName)
    })
  })

  if (schoolSet.size === 0 && isFallbackNeeded) {
    const fallbackChapters =
      selectedChapters.length > 0 ? selectedChapters : Object.keys(branchMap)
    fallbackChapters.forEach((ch) => {
      ;(branchMap[ch] ?? []).forEach((s: string) => schoolSet.add(s))
    })
  }

  return Array.from(schoolSet).map((school: string) => ({
    value: school,
    label: school,
  }))
}

interface ApplicantFilterBarProps {
  filters: ApplicantListFilters
  onFiltersChange: (partial: Partial<ApplicantListFilters>) => void
  resultFilterLabel: string
  chapterScope?: Chapter
  hideSchoolControls?: boolean
  className?: string
}

export function ApplicantFilterBar({
  filters,
  onFiltersChange,
  resultFilterLabel,
  chapterScope,
  hideSchoolControls = false,
  className,
}: ApplicantFilterBarProps) {
  const [openKey, setOpenKey] = useState<string | null>(null)
  const { chapters: serverChapters, isLoading, isError } = useSchoolChapterMap()

  const chapterOptions = useMemo(
    () => [
      { value: CHAPTER_ALL_VALUE, label: "지부 전체" },
      ...serverChapters.map((ch) => ({
        value: ch.chapterName,
        label: ch.chapterName,
      })),
    ],
    [serverChapters],
  )

  const schoolOptions = useMemo(
    () =>
      buildSchoolOptions(
        filters,
        serverChapters,
        chapterScope,
        isLoading || Boolean(isError),
      ),
    [filters, serverChapters, chapterScope, isLoading, isError],
  )
  const showChapterFilter =
    filters.chapterTab === CHAPTER_ALL_VALUE &&
    !chapterScope &&
    !hideSchoolControls

  const multiDropdownProps = (
    key: keyof Pick<
      ApplicantListFilters,
      "chapters" | "schools" | "parts" | "progresses" | "results"
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
        onFiltersChange({ chapters: nextValues, schools: [] })
        return
      }
      onFiltersChange({ [key]: nextValues })
    },
  })

  return (
    <div className={cn("flex items-start justify-between gap-4", className)}>
      <SearchField
        aria-label="지원자 검색"
        placeholder="지원자 명으로 검색하세요"
        value={filters.search}
        onChange={(event) => onFiltersChange({ search: event.target.value })}
        className="w-80 shrink-0"
      />
      <div className="flex flex-wrap items-center justify-end gap-4">
        <span className="text-body-1-medium text-teal-gray-600 flex items-center gap-1">
          <FilterIcon className="text-teal-gray-600 size-4" />
          필터
        </span>
        <div className="flex items-center gap-2">
          {showChapterFilter && (
            <FilterDropdown
              {...multiDropdownProps(
                "chapters",
                "지부",
                chapterOptions,
                CHAPTER_ALL_VALUE,
              )}
            />
          )}
          {!hideSchoolControls && (
            <FilterDropdown
              {...multiDropdownProps("schools", "학교", schoolOptions)}
            />
          )}
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
