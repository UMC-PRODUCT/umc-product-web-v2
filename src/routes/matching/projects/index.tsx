// 프로젝트 목록 페이지
import { createFileRoute } from "@tanstack/react-router"
import { useState } from "react"

import { FilterDropdown } from "@/shared/ui/dropdown/FilterDropDown"

export const Route = createFileRoute("/matching/projects/")({
  component: MatchingProjectsListPage,
})

const PROJECT_LIST_FILTERS = [
  { id: "branch", label: "지부" },
  { id: "school", label: "학교" },
  { id: "part", label: "파트" },
  { id: "status", label: "모집 상태" },
] as const

function MatchingProjectsListPage() {
  const [openFilterId, setOpenFilterId] = useState<string | null>(null)

  return (
    <section className="flex w-full flex-col items-start justify-start pt-8">
      <div className="border-teal-gray-150 flex h-full min-w-242 flex-col gap-2.5 rounded-[12px] border bg-white px-8.5 py-8">
        <div className="flex flex-col items-start gap-1.5">
          <span className="text-heading-6-semibold text-teal-gray-900">
            프로젝트 목록
          </span>
          <span className="text-body-2-regular text-teal-gray-600 mb-3.5">
            모든 프로젝트를 한눈에 조회합니다.
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {PROJECT_LIST_FILTERS.map(({ id, label }) => (
            <FilterDropdown
              key={id}
              label={label}
              open={openFilterId === id}
              onClick={() =>
                setOpenFilterId((prev) => (prev === id ? null : id))
              }
              className={id === "status" ? "min-w-[8.25rem]" : undefined}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
