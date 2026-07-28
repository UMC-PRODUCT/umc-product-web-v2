import { createFileRoute, Link } from "@tanstack/react-router"
import { useMemo, useState } from "react"

import {
  useAdminSchoolsSummary,
  useSchoolList,
} from "@/entities/organization/hooks/useSchool"
import { useSchoolChapterMap } from "@/entities/organization/hooks/useSchoolChapterMap"
import { ChapterTabs } from "@/features/recruiting/ui/ChapterTabs"
import { SchoolCard } from "@/features/settings/ui/SchoolCard"
import { SchoolPagination } from "@/features/settings/ui/SchoolPagination"
import { SchoolSearchInput } from "@/features/settings/ui/SchoolSearchInput"
import {
  SchoolSortDropdown,
  type SchoolSortOption,
} from "@/features/settings/ui/SchoolSortDropdown"
import PlusIcon from "@/shared/assets/icon/plus/PlusIcon"
import { useActiveGisu } from "@/shared/hooks/useActiveGisu"
import { Button } from "@/shared/ui/Button"
import { PageLabel } from "@/shared/ui/page-label/PageLabel"

export const Route = createFileRoute("/manage/school/")({
  component: SchoolManagePage,
})

const PAGE_SIZE = 20

function SchoolManagePage() {
  const [selectedChapter, setSelectedChapter] = useState<string>("all")
  const [sortOption, setSortOption] = useState<SchoolSortOption>("name")
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)

  const { data: activeGisuData } = useActiveGisu()
  const activeGisuId = activeGisuData?.gisuId
    ? Number(activeGisuData.gisuId)
    : undefined
  const activeGisuText = activeGisuData?.gisu
    ? `${activeGisuData.gisu}기`
    : "11기"

  const { data: summaryData, isLoading: isSummaryLoading } =
    useAdminSchoolsSummary({ gisuId: activeGisuId, size: 1000 })
  const { data: schoolListData, isLoading: isListLoading } = useSchoolList()
  const { getChapterIdBySchool } = useSchoolChapterMap()

  const isLoading = isSummaryLoading && isListLoading

  const processedSchools = useMemo(() => {
    const rawList = schoolListData?.schools ?? []

    const summaryMap = new Map<
      string,
      { branch?: string; count?: number; chapterId?: number }
    >()
    if (summaryData?.content) {
      for (const item of summaryData.content) {
        const info = {
          branch: item.chapterName ?? undefined,
          count: item.activeChallengerCount ?? 0,
          chapterId: item.chapterId ?? undefined,
        }
        if (item.schoolId != null) {
          summaryMap.set(String(item.schoolId), info)
        }
        if (item.schoolName) {
          summaryMap.set(item.schoolName, info)
        }
      }
    }

    return rawList.map((school) => {
      const summaryInfo =
        summaryMap.get(school.schoolId) ?? summaryMap.get(school.schoolName)
      const chapterId = getChapterIdBySchool(school.schoolName)

      return {
        id: school.schoolId,
        name: school.schoolName,
        chapterId: summaryInfo?.chapterId ?? chapterId,
        branch:
          summaryInfo?.branch ??
          (chapterId ? `지부 ${chapterId}` : "지부 미지정"),
        count: summaryInfo?.count ?? 0,
      }
    })
  }, [summaryData, schoolListData, getChapterIdBySchool])

  const filteredSchools = useMemo(() => {
    return processedSchools
      .filter((school) => {
        if (selectedChapter !== "all") {
          const target = selectedChapter.toLowerCase()
          const branch = school.branch.toLowerCase()
          if (branch !== target && !branch.includes(target)) {
            return false
          }
        }
        if (!searchQuery.trim()) return true
        return school.name
          .toLowerCase()
          .includes(searchQuery.trim().toLowerCase())
      })
      .sort((a, b) => {
        if (sortOption === "name") {
          return a.name.localeCompare(b.name, "ko")
        }
        return 0
      })
  }, [processedSchools, selectedChapter, searchQuery, sortOption])

  const totalPages = Math.max(1, Math.ceil(filteredSchools.length / PAGE_SIZE))
  const paginatedSchools = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE
    return filteredSchools.slice(start, start + PAGE_SIZE)
  }, [filteredSchools, currentPage])

  return (
    <div className="flex w-full max-w-244 flex-col gap-8">
      <PageLabel
        breadcrumb={[
          { id: "settings", label: "설정" },
          { id: "school", label: "학교 관리" },
        ]}
        title="학교 관리"
        description={`UMC ${activeGisuText} 소속의 학교 정보를 관리합니다.`}
        className="pl-3"
      />

      <div className="flex w-full flex-col gap-6">
        <ChapterTabs
          value={selectedChapter}
          onValueChange={(val) => {
            setSelectedChapter(val)
            setCurrentPage(1)
          }}
        />

        <div className="flex w-full items-center justify-between">
          <SchoolSearchInput
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setCurrentPage(1)
            }}
          />

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

        {isLoading ? (
          <div className="text-body-1-medium text-teal-gray-400 py-12 text-center">
            학교 정보를 불러오는 중입니다...
          </div>
        ) : paginatedSchools.length === 0 ? (
          <div className="text-body-1-medium text-teal-gray-400 py-12 text-center">
            등록된 학교가 없거나 검색 결과가 없습니다.
          </div>
        ) : (
          <div className="grid w-full grid-cols-2 gap-2">
            {paginatedSchools.map((school) => (
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
        )}
      </div>

      <SchoolPagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </div>
  )
}
