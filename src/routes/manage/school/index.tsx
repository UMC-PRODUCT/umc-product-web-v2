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

  const { getChapterIdBySchool, getChapterIdByName } = useSchoolChapterMap()

  const chapterIdParam = useMemo(() => {
    if (selectedChapter === "all") return undefined
    const num = Number(selectedChapter)
    if (!Number.isNaN(num)) return num
    return getChapterIdByName(selectedChapter)
  }, [selectedChapter, getChapterIdByName])

  const { data: summaryData, isLoading: isSummaryLoading } =
    useAdminSchoolsSummary({
      gisuId: activeGisuId,
      chapterId: chapterIdParam,
      search: searchQuery.trim() || undefined,
      page: currentPage - 1,
      size: PAGE_SIZE,
    })
  const { isLoading: isListLoading } = useSchoolList()

  const isLoading = isSummaryLoading || isListLoading

  const paginatedSchools = useMemo(() => {
    if (!summaryData?.content) return []
    return summaryData.content
      .map((item) => {
        const fallbackChapterId = item.schoolName
          ? getChapterIdBySchool(item.schoolName)
          : undefined
        const chapterId = item.chapterId ?? fallbackChapterId
        return {
          id: item.schoolId != null ? String(item.schoolId) : "",
          name: item.schoolName ?? "",
          chapterId,
          branch:
            item.chapterName ??
            (chapterId ? `지부 ${chapterId}` : "지부 미지정"),
          count: item.activeChallengerCount ?? 0,
        }
      })
      .sort((a, b) => {
        if (sortOption === "name") {
          return a.name.localeCompare(b.name, "ko")
        }
        return 0
      })
  }, [summaryData, getChapterIdBySchool, sortOption])

  const totalPages = Math.max(1, summaryData?.totalPages ?? 1)

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
