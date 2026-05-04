import { useCallback, useMemo, useState } from "react"

import {
  type MatchingProject,
  MOCK_MATCHING_PROJECTS,
} from "./matchingProject.mock"
import {
  BRANCH_OPTIONS,
  getSchoolOptionsByBranch,
  PART_OPTIONS,
  type ProjectFilterOption,
  RECRUIT_STATUS_OPTIONS,
} from "./projectFilterOptions"

// ─── 모집 상태 ──────

export type MatchingProjectRecruitStatusKey =
  | "before"
  | "completed"
  | "recruiting"

export function getProjectRecruitStatus(
  project: MatchingProject,
): MatchingProjectRecruitStatusKey {
  if (project.recruitRows.length === 0) return "before"

  const allCompleted = project.recruitRows.every(
    (row) => row.total > 0 && row.current >= row.total,
  )
  if (allCompleted) return "completed"

  const allBefore = project.recruitRows.every((row) => row.current === 0)
  if (allBefore) return "before"

  return "recruiting"
}

// ─── 목록 필터 ───-

export type MatchingProjectListFilterCriteria = {
  branch?: string
  school?: string
  selectedParts: string[]
  recruitStatus?: string
}

export function filterMatchingProjects(
  projects: MatchingProject[],
  criteria: MatchingProjectListFilterCriteria,
): MatchingProject[] {
  const { branch, school, selectedParts, recruitStatus } = criteria

  return projects.filter((project) => {
    if (branch && project.branch !== branch) return false
    if (school && project.school !== school) return false

    const projectParts = new Set(project.recruitRows.map((row) => row.part))
    const partMatched =
      selectedParts.length === 0 ||
      selectedParts.every((part) => projectParts.has(part))
    if (!partMatched) return false

    if (recruitStatus && getProjectRecruitStatus(project) !== recruitStatus) {
      return false
    }

    return true
  })
}

// ─── 칩, 패널 클래스 ──────
const MATCHING_PROJECT_LIST_FILTER_LAYOUT = {
  branch: {
    className: "w-fit min-w-20",
    dropdownClassName: "w-[9.5rem]",
  },
  school: {
    className: "w-fit min-w-20",
    dropdownClassName: "w-[9.5rem]",
  },
  part: {
    className: "w-fit min-w-20",
    dropdownClassName: "w-[9.125rem]",
  },
  // 114px 고정 (디자이너님 요청)
  status: {
    className: "w-[114px]",
    dropdownClassName: "w-[114px] min-w-[114px]",
  },
} as const

// ─── 페이지 훅 (상태 + 필터 UI 디스크립터) ──────

export type MatchingProjectListFilterId =
  | "branch"
  | "school"
  | "part"
  | "status"

export type MatchingProjectListFilterDescriptor = {
  id: MatchingProjectListFilterId
  label: string
  options: ProjectFilterOption[]
  className: string
  dropdownClassName?: string
  selectedValue?: string
  selectedValues?: string[]
  selectedLabel?: string
  onSelect: (value: string) => void
  multiSelect?: boolean
}

export function useMatchingProjectListFilters() {
  const [openFilterId, setOpenFilterId] = useState<string | null>(null)
  const [selectedBranch, setSelectedBranch] = useState<string>()
  const [selectedSchool, setSelectedSchool] = useState<string>()
  const [selectedParts, setSelectedParts] = useState<string[]>([])
  const [selectedRecruitStatus, setSelectedRecruitStatus] = useState<string>()

  const schoolOptions = getSchoolOptionsByBranch(selectedBranch)

  const selectedPartLabel = useMemo(() => {
    if (selectedParts.length === 0) return undefined
    if (selectedParts.length === 1) return selectedParts[0]
    return `${selectedParts[0]} 외 ${selectedParts.length - 1}`
  }, [selectedParts])

  const selectedRecruitStatusLabel = useMemo(
    () =>
      RECRUIT_STATUS_OPTIONS.find(
        (option) => option.value === selectedRecruitStatus,
      )?.label,
    [selectedRecruitStatus],
  )

  const filteredProjects = useMemo(
    () =>
      filterMatchingProjects(MOCK_MATCHING_PROJECTS, {
        branch: selectedBranch,
        school: selectedSchool,
        selectedParts,
        recruitStatus: selectedRecruitStatus,
      }),
    [selectedBranch, selectedParts, selectedRecruitStatus, selectedSchool],
  )

  const filterKey = [
    selectedBranch ?? "",
    selectedSchool ?? "",
    [...selectedParts].sort().join("|"),
    selectedRecruitStatus ?? "",
  ].join("\u0001")

  const handlePartSelect = useCallback((value: string) => {
    setSelectedParts((prev) =>
      prev.includes(value)
        ? prev.filter((selected) => selected !== value)
        : [...prev, value],
    )
  }, [])

  const handleRecruitStatusSelect = useCallback((value: string) => {
    setSelectedRecruitStatus((prev) => (prev === value ? undefined : value))
  }, [])

  const filterDescriptors: MatchingProjectListFilterDescriptor[] = [
    {
      id: "branch",
      label: "지부",
      options: BRANCH_OPTIONS,
      selectedValue: selectedBranch,
      onSelect: (value) => {
        setSelectedBranch((prev) => (prev === value ? undefined : value))
        setSelectedSchool(undefined)
      },
      ...MATCHING_PROJECT_LIST_FILTER_LAYOUT.branch,
    },
    {
      id: "school",
      label: "PM 학교",
      options: schoolOptions,
      selectedValue: selectedSchool,
      onSelect: (value) =>
        setSelectedSchool((prev) => (prev === value ? undefined : value)),
      ...MATCHING_PROJECT_LIST_FILTER_LAYOUT.school,
    },
    {
      id: "part",
      label: "파트",
      options: PART_OPTIONS,
      selectedValues: selectedParts,
      selectedLabel: selectedPartLabel,
      onSelect: handlePartSelect,
      multiSelect: true,
      ...MATCHING_PROJECT_LIST_FILTER_LAYOUT.part,
    },
    {
      id: "status",
      label: "모집 상태",
      options: RECRUIT_STATUS_OPTIONS,
      selectedValue: selectedRecruitStatus,
      selectedLabel: selectedRecruitStatusLabel,
      onSelect: handleRecruitStatusSelect,
      ...MATCHING_PROJECT_LIST_FILTER_LAYOUT.status,
    },
  ]

  return {
    openFilterId,
    setOpenFilterId,
    filteredProjects,
    filterDescriptors,
    filterKey,
    selectedBranch,
  }
}
