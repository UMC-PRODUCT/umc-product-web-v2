import { useMatchingProjectListFilters } from "../model/matchingProjectList"
import { FilterDropdown } from "./FilterDropDown"
import { MatchingProjectCard } from "./MatchingProjectCard"
import { ProjectSearchField } from "./ProjectSearchField"

export function MatchingProjectsListPage() {
  const { openFilterId, setOpenFilterId, filteredProjects, filterDescriptors } =
    useMatchingProjectListFilters()

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
      <div className="border-teal-gray-150 relative z-30 flex h-full min-w-242 flex-col gap-5 rounded-xl border bg-white px-8.5 py-8">
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
            {filterDescriptors.map((filter) =>
              filter.multiSelect ? (
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
                  multiSelect
                  selectedValues={filter.selectedValues ?? []}
                  onRequestClose={() => setOpenFilterId(null)}
                  dropdownClassName={filter.dropdownClassName}
                  className={filter.className}
                />
              ) : (
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
                  selectedValue={filter.selectedValue}
                  onRequestClose={() => setOpenFilterId(null)}
                  dropdownClassName={filter.dropdownClassName}
                  className={filter.className}
                />
              ),
            )}
          </div>
        </div>

        <div className="grid min-w-0 grid-cols-1 gap-5 md:grid-cols-3">
          {filteredProjects.map((project) => (
            <div key={project.id} className="min-w-0">
              <MatchingProjectCard variant="default" data={project} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
