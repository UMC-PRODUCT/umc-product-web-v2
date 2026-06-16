import { useEffect, useMemo, useRef, useState } from "react"

import { trackEvent } from "@/shared/analytics"
import { useSchoolChapterMap } from "@/shared/hooks/useSchoolChapterMap"
import { formatSchoolName } from "@/shared/lib/formatSchoolName"
import { cn } from "@/shared/lib/utils"
import { Modal } from "@/shared/ui/Modal"
import { Pagination } from "@/shared/ui/Pagination"

import { MOCK_MATCHING_PROJECTS } from "../model/matchingProject.mock"
import { useMatchingProjectListFilters } from "../model/matchingProjectList"
import { FilterDropdown } from "./FilterDropDown"
import { MatchingProjectCard } from "./MatchingProjectCard"
import { ProjectDetailCard } from "./ProjectDetailCard"
import { ProjectSearchField } from "./ProjectSearchField"

import type { ProjectItem } from "../api/matchingProject"
import type { MatchingProject } from "../model/matchingProject"

const PART_LABEL: Record<string, string> = {
  PLAN: "기획",
  DESIGN: "Design",
  WEB: "Web",
  IOS: "iOS",
  ANDROID: "Android",
  SPRINGBOOT: "SpringBoot",
  NODEJS: "Node.js",
}
const PART_ORDER = ["DESIGN", "WEB", "IOS", "ANDROID", "SPRINGBOOT", "NODEJS"]

function toMatchingProject(project: ProjectItem): MatchingProject {
  const owner = project.productOwner
  const ownerLine = [
    owner?.nickname && owner?.name
      ? `${owner.nickname}/${owner.name}`
      : (owner?.name ?? ""),
    formatSchoolName(owner?.schoolName),
  ]
    .filter(Boolean)
    .join(" · ")

  return {
    id: String(project.id),
    branch: "",
    school: owner?.schoolName ?? "",
    title: project.name,
    description: project.description,
    authorSchoolLine: ownerLine,
    coverImage: project.thumbnailImageUrl
      ? { src: project.thumbnailImageUrl }
      : null,
    recruitRows: [...(project.partQuotas ?? [])]
      .sort((a, b) => {
        const ai = PART_ORDER.indexOf(a.part ?? "")
        const bi = PART_ORDER.indexOf(b.part ?? "")
        return (ai === -1 ? Infinity : ai) - (bi === -1 ? Infinity : bi)
      })
      .map((q) => ({
        part: PART_LABEL[q.part ?? ""] ?? q.part ?? "",
        current: Number(q.currentCount),
        total: Number(q.quota),
      })),
    partQuotaStatus: project.partQuotaStatus,
  }
}

interface MatchingProjectsListPageProps {
  useMockData?: boolean
}

export function MatchingProjectsListPage({
  useMockData = false,
}: MatchingProjectsListPageProps) {
  const {
    openFilterId,
    setOpenFilterId,
    projects,
    totalPages,
    page,
    setPage,
    searchQuery,
    setSearchQuery,
    isLoading,
    isError,
    filterDescriptors,
  } = useMatchingProjectListFilters()

  const { getChapterIdBySchool } = useSchoolChapterMap()

  const [selectedProjectId, setSelectedProjectId] = useState<
    number | string | null
  >(null)
  const [selectedProjectChapterId, setSelectedProjectChapterId] = useState<
    number | undefined
  >(undefined)
  const filterAreaRef = useRef<HTMLDivElement>(null)
  const visibleProjects = useMemo(
    () =>
      useMockData ? MOCK_MATCHING_PROJECTS : projects.map(toMatchingProject),
    [useMockData, projects],
  )

  useEffect(() => {
    trackEvent("project_list_view", {
      use_mock_data: useMockData,
      project_count: visibleProjects.length,
    })
  }, [useMockData, visibleProjects.length])

  useEffect(() => {
    const trimmedLength = searchQuery.trim().length
    if (trimmedLength === 0) return
    const timer = setTimeout(() => {
      trackEvent("project_search_used", {
        query_length_bucket: getSearchLengthBucket(trimmedLength),
      })
    }, 600)
    return () => clearTimeout(timer)
  }, [searchQuery])

  useEffect(() => {
    if (useMockData || isLoading || isError) return
    if (visibleProjects.length > 0) return
    trackEvent("project_empty_result", {
      has_search_query: searchQuery.trim().length > 0,
    })
  }, [useMockData, isLoading, isError, searchQuery, visibleProjects.length])

  useEffect(() => {
    if (!openFilterId) return

    function handlePointerDown(event: PointerEvent) {
      const target = event.target
      if (!(target instanceof Node)) return
      if (filterAreaRef.current?.contains(target)) return
      setOpenFilterId(null)
    }

    document.addEventListener("pointerdown", handlePointerDown)
    return () => document.removeEventListener("pointerdown", handlePointerDown)
  }, [openFilterId, setOpenFilterId])

  return (
    <section className="relative isolate flex w-full min-w-0 flex-col items-stretch justify-start">
      {openFilterId && (
        <button
          type="button"
          aria-label="필터 드롭다운 닫기"
          className="fixed inset-0 z-20 cursor-default bg-transparent"
          onClick={() => setOpenFilterId(null)}
        />
      )}
      <div className="border-teal-gray-100 bp1:rounded-[12px] bp1:border bp1:px-6 bp1:pt-8 bp1:pb-10 bp2:max-w-288 bp2:px-8.5 relative z-30 flex h-full w-full min-w-0 flex-col gap-5 bg-white px-4 pt-6 pb-8">
        <div className="flex flex-col items-start gap-1.5">
          <span className="text-heading-6-semibold text-teal-gray-900">
            프로젝트 목록
          </span>
          <span className="text-body-2-regular text-teal-gray-600">
            모든 프로젝트를 한눈에 조회합니다.
          </span>
        </div>

        <div className="bp2:flex-row bp2:items-start bp2:justify-between relative z-30 mb-3 flex min-w-0 flex-col gap-3 self-stretch">
          <ProjectSearchField
            value={searchQuery}
            onChange={setSearchQuery}
            className="bp2:w-[28.5rem]"
          />
          <div
            ref={filterAreaRef}
            className="scrollbar-none bp2:w-auto bp2:overflow-visible bp2:pb-0 flex w-full min-w-0 items-center gap-2 overflow-x-auto pb-1"
          >
            {filterDescriptors.map((filter) => (
              <FilterDropdown
                key={filter.id}
                label={filter.label}
                open={openFilterId === filter.id}
                onClick={() =>
                  setOpenFilterId((prev) => {
                    const next = prev === filter.id ? null : filter.id
                    if (next) {
                      trackEvent("project_filter_open", {
                        filter_id: filter.id,
                      })
                    }
                    return next
                  })
                }
                options={filter.options}
                onSelect={(value) => {
                  filter.onSelect(value)
                  trackEvent("project_filter_select", {
                    filter_id: filter.id,
                    selected_count:
                      filter.multiSelect && filter.selectedValues
                        ? filter.selectedValues.includes(value)
                          ? Math.max(0, filter.selectedValues.length - 1)
                          : filter.selectedValues.length + 1
                        : filter.selectedValue === value
                          ? 0
                          : 1,
                  })
                }}
                selectedLabel={filter.selectedLabel}
                onRequestClose={() => setOpenFilterId(null)}
                dropdownClassName={filter.dropdownClassName}
                className={filter.className}
                {...(filter.multiSelect
                  ? {
                      multiSelect: true,
                      selectedValues: filter.selectedValues ?? [],
                    }
                  : {
                      multiSelect: false,
                      selectedValue: filter.selectedValue,
                    })}
              />
            ))}
          </div>
        </div>

        <div
          className={cn(
            "bp1:grid-cols-2 bp2:grid-cols-3 grid min-w-0 grid-cols-1 gap-5",
            openFilterId && "pointer-events-none",
          )}
        >
          {visibleProjects.map((project, index) => {
            return (
              <div key={project.id} className="min-w-0">
                <button
                  type="button"
                  className={cn(
                    "w-full text-left",
                    useMockData && "cursor-default",
                  )}
                  onClick={() => {
                    if (useMockData) return
                    const item = projects[index]
                    if (!item) return
                    trackEvent("project_card_click", {
                      project_id: item.id,
                      card_index: index,
                      page,
                    })
                    setSelectedProjectId(item.id)
                    setSelectedProjectChapterId(
                      getChapterIdBySchool(item.productOwner?.schoolName ?? ""),
                    )
                  }}
                >
                  <MatchingProjectCard variant="default" data={project} />
                </button>
              </div>
            )
          })}
        </div>

        {!useMockData && projects.length > 0 && (
          <Pagination
            className="mt-5 self-center"
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        )}
      </div>

      <Modal.Root
        open={selectedProjectId !== null}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedProjectId(null)
            setSelectedProjectChapterId(undefined)
          }
        }}
      >
        <Modal.Portal>
          <Modal.Overlay tone="deep" />
          <Modal.Content
            className="shadow-drop-neutral-3 rounded-2xl"
            aria-describedby={undefined}
          >
            <Modal.Title className="sr-only">프로젝트 상세</Modal.Title>
            {selectedProjectId !== null && (
              <ProjectDetailCard
                projectId={selectedProjectId}
                projectChapterId={selectedProjectChapterId}
              />
            )}
          </Modal.Content>
        </Modal.Portal>
      </Modal.Root>
    </section>
  )
}

function getSearchLengthBucket(length: number) {
  if (length <= 2) return "1_2"
  if (length <= 5) return "3_5"
  if (length <= 10) return "6_10"
  return "over_10"
}
