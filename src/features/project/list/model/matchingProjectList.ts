import { useQuery } from "@tanstack/react-query"
import { useCallback, useEffect, useMemo, useState } from "react"

import {
  getAllGisu,
  getChaptersWithSchools,
} from "@/features/challenger/api/organization"

import { getMatchingProjects, type ProjectItem } from "../api/matchingProject"
import {
  PART_OPTIONS,
  type ProjectFilterOption,
  RECRUIT_STATUS_OPTIONS,
} from "./projectFilterOptions"

import type { PartQuotaStatus, ProjectPart } from "../api/matchingProject"

export const MATCHING_PROJECT_PAGE_SIZE = 15

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

const FILTER_LAYOUT = {
  branch: { className: "w-fit min-w-20", dropdownClassName: "w-[9.5rem]" },
  school: { className: "w-fit min-w-20", dropdownClassName: "w-[9.5rem]" },
  part: { className: "w-fit min-w-20", dropdownClassName: "w-[9.125rem]" },
  status: {
    className: "w-[7.125rem]",
    dropdownClassName: "w-[7.125rem] min-w-[7.125rem]",
  },
} as const

export function useMatchingProjectListFilters() {
  const [openFilterId, setOpenFilterId] = useState<string | null>(null)
  const [selectedBranch, setSelectedBranch] = useState<string>()
  const [selectedSchool, setSelectedSchool] = useState<string>()
  const [selectedParts, setSelectedParts] = useState<ProjectPart[]>([])
  const [selectedRecruitStatus, setSelectedRecruitStatus] =
    useState<PartQuotaStatus>()
  const [searchQuery, setSearchQuery] = useState("")
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("")
  const [page, setPage] = useState(1)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearchQuery(searchQuery), 300)
    return () => clearTimeout(timer)
  }, [searchQuery])

  useEffect(() => {
    setPage(1)
  }, [
    selectedBranch,
    selectedSchool,
    selectedParts,
    selectedRecruitStatus,
    debouncedSearchQuery,
  ])

  const { data: gisuData } = useQuery({
    queryKey: ["gisu", "active"],
    queryFn: async () => {
      const res = await getAllGisu()
      const active = res.gisuList.find((g) => g.isActive)
      return active ? Number(active.gisuId) : null
    },
  })

  const activeGisuId = gisuData ?? undefined

  const { data: chaptersData } = useQuery({
    queryKey: ["chaptersWithSchools", activeGisuId],
    queryFn: () => getChaptersWithSchools(String(activeGisuId!)),
    enabled: activeGisuId !== undefined,
  })

  const branchOptions: ProjectFilterOption[] = useMemo(
    () =>
      (chaptersData?.chapters ?? []).map((ch) => ({
        value: ch.chapterId,
        label: ch.chapterName,
      })),
    [chaptersData],
  )

  const schoolOptions: ProjectFilterOption[] = useMemo(
    () =>
      selectedBranch
        ? (
            chaptersData?.chapters.find((ch) => ch.chapterId === selectedBranch)
              ?.schools ?? []
          ).map((s) => ({ value: s.schoolId, label: s.schoolName }))
        : [],
    [chaptersData, selectedBranch],
  )

  const { data, isLoading } = useQuery({
    queryKey: [
      "matchingProjects",
      activeGisuId,
      page,
      debouncedSearchQuery,
      selectedBranch,
      selectedSchool,
      selectedParts,
      selectedRecruitStatus,
    ],
    queryFn: () =>
      getMatchingProjects({
        gisuId: activeGisuId!,
        keyword: debouncedSearchQuery || undefined,
        chapterId: selectedBranch ? Number(selectedBranch) : undefined,
        schoolIds: selectedSchool ? [Number(selectedSchool)] : undefined,
        parts: selectedParts.length > 0 ? selectedParts : undefined,
        partQuotaStatus: selectedRecruitStatus,
        page: page - 1,
        size: MATCHING_PROJECT_PAGE_SIZE,
      }),
    enabled: activeGisuId !== undefined,
  })

  const selectedBranchLabel = useMemo(
    () => branchOptions.find((o) => o.value === selectedBranch)?.label,
    [branchOptions, selectedBranch],
  )

  const selectedSchoolLabel = useMemo(
    () => schoolOptions.find((o) => o.value === selectedSchool)?.label,
    [schoolOptions, selectedSchool],
  )

  const selectedPartLabel = useMemo(() => {
    if (selectedParts.length === 0) return undefined
    if (selectedParts.length === 1)
      return PART_OPTIONS.find((o) => o.value === selectedParts[0])?.label
    return `${PART_OPTIONS.find((o) => o.value === selectedParts[0])?.label} 외 ${selectedParts.length - 1}`
  }, [selectedParts])

  const selectedRecruitStatusLabel = useMemo(
    () =>
      RECRUIT_STATUS_OPTIONS.find(
        (option) => option.value === selectedRecruitStatus,
      )?.label,
    [selectedRecruitStatus],
  )

  const handlePartSelect = useCallback((value: string) => {
    setSelectedParts((prev) => {
      const part = value as ProjectPart
      return prev.includes(part)
        ? prev.filter((selected) => selected !== part)
        : [...prev, part]
    })
  }, [])

  const handleRecruitStatusSelect = useCallback((value: string) => {
    setSelectedRecruitStatus((prev) => {
      const status = value as PartQuotaStatus
      return prev === status ? undefined : status
    })
  }, [])

  const filterDescriptors: MatchingProjectListFilterDescriptor[] = [
    {
      id: "branch",
      label: "지부",
      options: branchOptions,
      selectedValue: selectedBranch,
      selectedLabel: selectedBranchLabel,
      onSelect: (value) => {
        setSelectedBranch((prev) => (prev === value ? undefined : value))
        setSelectedSchool(undefined)
      },
      ...FILTER_LAYOUT.branch,
    },
    {
      id: "school",
      label: "PM 학교",
      options: schoolOptions,
      selectedValue: selectedSchool,
      selectedLabel: selectedSchoolLabel,
      onSelect: (value) =>
        setSelectedSchool((prev) => (prev === value ? undefined : value)),
      ...FILTER_LAYOUT.school,
    },
    {
      id: "part",
      label: "파트",
      options: PART_OPTIONS,
      selectedValues: selectedParts,
      selectedLabel: selectedPartLabel,
      onSelect: handlePartSelect,
      multiSelect: true,
      ...FILTER_LAYOUT.part,
    },
    {
      id: "status",
      label: "모집 상태",
      options: RECRUIT_STATUS_OPTIONS,
      selectedValue: selectedRecruitStatus,
      selectedLabel: selectedRecruitStatusLabel,
      onSelect: handleRecruitStatusSelect,
      ...FILTER_LAYOUT.status,
    },
  ]

  return {
    openFilterId,
    setOpenFilterId,
    projects: data?.content ?? ([] as ProjectItem[]),
    totalPages: Math.max(1, data?.totalPages ?? 1),
    page,
    setPage,
    isLoading,
    searchQuery,
    setSearchQuery,
    filterDescriptors,
    selectedBranch,
  }
}
