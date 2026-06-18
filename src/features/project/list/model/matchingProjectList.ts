import { useQuery } from "@tanstack/react-query"
import { useCallback, useEffect, useMemo, useState } from "react"

import { isOperator } from "@/features/auth/model/identity"
import { getChaptersWithSchools } from "@/features/challenger/api/organization"
import { projectKeys } from "@/features/project/new/api"
import { useActiveGisu } from "@/shared/hooks/useActiveGisu"
import { formatSchoolName } from "@/shared/lib/formatSchoolName"
import { useViewerIdentity } from "@/shared/view-mode/useViewerIdentity"

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
  school: {
    className: "w-fit min-w-20",
    dropdownClassName:
      "scrollbar-none w-[9.5rem] max-h-[25.25rem] overflow-y-auto",
  },
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

  const { me, viewContext } = useViewerIdentity()
  const userIsOperator = isOperator(me)

  const { data: gisuData } = useActiveGisu()

  const activeGisuId = gisuData?.gisuId ? Number(gisuData.gisuId) : undefined

  const userGisuId = useMemo(() => {
    const records = me?.challengerRecords
    if (!records?.length) return undefined
    const latest = [...records].sort(
      (a, b) => Number(b.gisuId) - Number(a.gisuId),
    )[0]
    return latest ? Number(latest.gisuId) : undefined
  }, [me])

  const effectiveGisuId =
    viewContext.isAdminView && userIsOperator ? activeGisuId : userGisuId

  const { data: chaptersData } = useQuery({
    queryKey: ["chaptersWithSchools", activeGisuId],
    queryFn: () => getChaptersWithSchools(String(activeGisuId!)),
    enabled: activeGisuId != null,
  })

  const branchOptions: ProjectFilterOption[] = useMemo(
    () =>
      (chaptersData?.chapters ?? []).map((ch) => ({
        value: ch.chapterId,
        label: ch.chapterName,
      })),
    [chaptersData],
  )

  const schoolOptions: ProjectFilterOption[] = useMemo(() => {
    const schools = selectedBranch
      ? (chaptersData?.chapters.find((ch) => ch.chapterId === selectedBranch)
          ?.schools ?? [])
      : (chaptersData?.chapters ?? []).flatMap((ch) => ch.schools)

    return schools
      .map((s) => ({
        value: s.schoolId,
        label: formatSchoolName(s.schoolName),
      }))
      .sort((a, b) => a.label.localeCompare(b.label, "ko"))
  }, [chaptersData, selectedBranch])

  const { data, isLoading, isError } = useQuery({
    queryKey: projectKeys.list({
      gisuId: effectiveGisuId,
      page,
      keyword: debouncedSearchQuery,
      chapterId: selectedBranch,
      schoolId: selectedSchool,
      parts: selectedParts,
      partQuotaStatus: selectedRecruitStatus,
    }),
    queryFn: () =>
      getMatchingProjects({
        gisuId: effectiveGisuId!,
        keyword: debouncedSearchQuery || undefined,
        chapterId: selectedBranch ? Number(selectedBranch) : undefined,
        schoolIds: selectedSchool ? [Number(selectedSchool)] : undefined,
        parts: selectedParts.length > 0 ? selectedParts : undefined,
        partQuotaStatus: selectedRecruitStatus,
        statuses: ["IN_PROGRESS"],
        page: page - 1,
        size: MATCHING_PROJECT_PAGE_SIZE,
      }),
    enabled: effectiveGisuId != null,
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
    totalPages: Math.max(1, Number(data?.totalPages ?? 1)),
    page,
    setPage,
    isLoading,
    isError,
    searchQuery,
    setSearchQuery,
    filterDescriptors,
    selectedBranch,
  }
}
