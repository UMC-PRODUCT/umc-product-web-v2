import { useEffect, useMemo, useState } from "react"

import { Modal } from "@/shared/ui/Modal"
import { Pagination } from "@/shared/ui/Pagination"

import { useMatchingProjectListFilters } from "../model/matchingProjectList"
import { FilterDropdown } from "./FilterDropDown"
import { MatchingProjectCard } from "./MatchingProjectCard"
import { ProjectDetailCard } from "./ProjectDetailCard"
import { ProjectSearchField } from "./ProjectSearchField"

import type { MatchingProjectMock } from "../model/matchingProject.mock"

const PROJECT_LIST_PAGE_SIZE = 15

export function MatchingProjectsListPage() {
  const {
    openFilterId,
    setOpenFilterId,
    filteredProjects,
    filterDescriptors,
    filterKey,
  } = useMatchingProjectListFilters()

  const [page, setPage] = useState(1)
  const [selectedProject, setSelectedProject] =
    useState<MatchingProjectMock | null>(null)

  useEffect(() => {
    setPage(1)
  }, [filterKey])

  const totalPages = Math.max(
    1,
    Math.ceil(filteredProjects.length / PROJECT_LIST_PAGE_SIZE),
  )

  const displayPage = Math.min(Math.max(1, page), totalPages)

  const paginatedProjects = useMemo(() => {
    const start = (displayPage - 1) * PROJECT_LIST_PAGE_SIZE
    return filteredProjects.slice(start, start + PROJECT_LIST_PAGE_SIZE)
  }, [filteredProjects, displayPage])

  return (
    <section className="relative flex w-full flex-col items-start justify-start pt-8">
      {openFilterId && (
        <button
          type="button"
          aria-label="필터 드롭다운 닫기"
          className="fixed inset-0 z-20 cursor-default bg-transparent"
          onClick={() => setOpenFilterId(null)}
        />
      )}
      <div className="border-teal-gray-150 relative z-30 flex h-full min-w-242 flex-col gap-5 rounded-xl border bg-white px-8.5 pt-8 pb-10">
        <div className="flex flex-col items-start gap-1.5">
          <span className="text-heading-6-semibold text-teal-gray-900">
            프로젝트 목록
          </span>
          <span className="text-body-2-regular text-teal-gray-600">
            모든 프로젝트를 한눈에 조회합니다.
          </span>
        </div>

        <div className="relative z-30 mb-3 flex items-start justify-between self-stretch">
          <ProjectSearchField />
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

        <div className="grid min-w-0 grid-cols-1 gap-5 md:grid-cols-3">
          {paginatedProjects.map((project) => (
            <div key={project.id} className="min-w-0">
              <button
                type="button"
                className="w-full text-left"
                onClick={() => setSelectedProject(project)}
              >
                <MatchingProjectCard variant="default" data={project} />
              </button>
            </div>
          ))}
        </div>

        {filteredProjects.length > 0 ? (
          <Pagination
            className="mt-5 self-center"
            currentPage={displayPage}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        ) : null}
      </div>

      <Modal.Root
        open={Boolean(selectedProject)}
        onOpenChange={(open) => {
          if (!open) setSelectedProject(null)
        }}
      >
        <Modal.Portal>
          <Modal.Overlay tone="deep" />
          <Modal.Content>
            {selectedProject ? (
              <ProjectDetailCard data={selectedProject} />
            ) : null}
          </Modal.Content>
        </Modal.Portal>
      </Modal.Root>
    </section>
  )
}
