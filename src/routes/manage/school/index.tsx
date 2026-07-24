import { createFileRoute, Link } from "@tanstack/react-router"
import { useState } from "react"

import { ChapterTabs } from "@/features/recruiting/ui/ChapterTabs"
import { SchoolCard } from "@/features/settings/ui/SchoolCard"
import { SchoolPagination } from "@/features/settings/ui/SchoolPagination"
import { SchoolSearchInput } from "@/features/settings/ui/SchoolSearchInput"
import {
  SchoolSortDropdown,
  type SchoolSortOption,
} from "@/features/settings/ui/SchoolSortDropdown"
import PlusIcon from "@/shared/assets/icon/plus/PlusIcon"
import { Button } from "@/shared/ui/Button"
import { PageLabel } from "@/shared/ui/page-label/PageLabel"

export const Route = createFileRoute("/manage/school/")({
  component: SchoolManagePage,
})

const MOCK_SCHOOLS = [
  { id: "1", branch: "Chromium", name: "가가대학교", count: 127 },
  { id: "2", branch: "Chromium", name: "가가대학교", count: 127 },
  { id: "3", branch: "Chromium", name: "가가대학교", count: 127 },
]

function SchoolManagePage() {
  const [selectedChapter, setSelectedChapter] = useState<string>("all")
  const [sortOption, setSortOption] = useState<SchoolSortOption>("name")
  const [currentPage, setCurrentPage] = useState(1)

  return (
    <div className="flex w-full max-w-244 flex-col gap-8">
      <PageLabel
        breadcrumb={[
          { id: "settings", label: "설정" },
          { id: "school", label: "학교 관리" },
        ]}
        title="학교 관리"
        description="UMC 11기 소속의 학교 정보를 관리합니다."
        className="pl-3"
      />

      <div className="flex w-full flex-col gap-6">
        <ChapterTabs
          value={selectedChapter}
          onValueChange={setSelectedChapter}
        />

        <div className="flex w-full items-center justify-between">
          <SchoolSearchInput />

          <div className="flex items-center gap-4">
            <Button
              asChild
              size="m"
              color="primary"
              variant="fill"
              className="flex items-center gap-1 py-[11px] pr-3.5 pl-3"
            >
              <Link to="/manage/school/register">
                <PlusIcon className="h-4 w-4" /> 학교 등록
              </Link>
            </Button>

            <SchoolSortDropdown
              value={sortOption}
              onValueChange={setSortOption}
            />
          </div>
        </div>

        <div className="grid w-full grid-cols-2 gap-2">
          {MOCK_SCHOOLS.map((school) => (
            <Link
              key={school.id}
              to="/manage/school/$schoolId"
              params={{ schoolId: school.id }}
              className="block w-full text-left"
            >
              <SchoolCard
                branch={school.branch}
                name={school.name}
                count={school.count}
                className="cursor-pointer"
              />
            </Link>
          ))}
        </div>
      </div>

      <SchoolPagination
        currentPage={currentPage}
        totalPages={3}
        onPageChange={setCurrentPage}
      />
    </div>
  )
}
