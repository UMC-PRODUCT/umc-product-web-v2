import { useState } from "react"

import { formatSchoolName } from "@/shared/lib/formatSchoolName"
import { cn } from "@/shared/lib/utils"
import { Modal } from "@/shared/ui/Modal"
import { Pagination } from "@/shared/ui/Pagination"

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
const PART_ORDER = Object.keys(PART_LABEL)

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

export function MatchingProjectsListPage() {
  const {
    openFilterId,
    setOpenFilterId,
    projects,
    totalPages,
    page,
    setPage,
    searchQuery,
    setSearchQuery,
    filterDescriptors,
  } = useMatchingProjectListFilters()

  const [selectedProjectId, setSelectedProjectId] = useState<
    number | string | null
  >(null)

  return (
    <section className="relative isolate flex w-full flex-col items-start justify-start">
      {openFilterId && (
        <button
          type="button"
          aria-label="필터 드롭다운 닫기"
          className="fixed inset-0 z-20 cursor-default bg-transparent"
          onClick={() => setOpenFilterId(null)}
        />
      )}
      <div className="border-teal-gray-100 relative z-30 flex h-full w-288 flex-col gap-5 rounded-[12px] border bg-white px-8.5 pt-8 pb-10">
        <div className="flex flex-col items-start gap-1.5">
          <span className="text-heading-6-semibold text-teal-gray-900">
            프로젝트 목록
          </span>
          <span className="text-body-2-regular text-teal-gray-600">
            모든 프로젝트를 한눈에 조회합니다.
          </span>
        </div>

        <div className="relative z-30 mb-3 flex items-start justify-between self-stretch">
          <ProjectSearchField value={searchQuery} onChange={setSearchQuery} />
          <div className="flex items-center gap-2">
            {filterDescriptors.map((filter) => (
              <FilterDropdown
                key={filter.id}
                label={filter.label}
                open={openFilterId === filter.id}
                onClick={() =>
                  setOpenFilterId((prev) =>
                    prev === filter.id ? null : filter.id,
                  )
                }
                options={filter.options}
                onSelect={filter.onSelect}
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
            "grid min-w-0 grid-cols-1 gap-5 md:grid-cols-3",
            openFilterId && "pointer-events-none",
          )}
        >
          {projects.map((item) => {
            const project = toMatchingProject(item)
            return (
              <div key={project.id} className="min-w-0">
                <button
                  type="button"
                  className="w-full text-left"
                  onClick={() => {
                    setSelectedProjectId(item.id)
                  }}
                >
                  <MatchingProjectCard variant="default" data={project} />
                </button>
              </div>
            )
          })}
        </div>

        {projects.length > 0 && (
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
              <ProjectDetailCard projectId={selectedProjectId} />
            )}
          </Modal.Content>
        </Modal.Portal>
      </Modal.Root>
    </section>
  )
}
