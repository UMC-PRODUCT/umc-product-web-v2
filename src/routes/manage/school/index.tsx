import { createFileRoute, Link } from "@tanstack/react-router"
import { isAxiosError } from "axios"
import { useMemo, useState } from "react"

import { useAdminSchoolsSummary } from "@/entities/organization/hooks/useSchool"
import { useSchoolChapterMap } from "@/entities/organization/hooks/useSchoolChapterMap"
import { ChapterTabs } from "@/features/recruiting/ui/ChapterTabs"
import { SchoolCard } from "@/features/settings/ui/SchoolCard"
import { SchoolPagination } from "@/features/settings/ui/SchoolPagination"
import { SchoolSearchInput } from "@/features/settings/ui/SchoolSearchInput"
import {
  SCHOOL_SORT_SERVER_VALUES,
  SchoolSortDropdown,
  type SchoolSortOption,
} from "@/features/settings/ui/SchoolSortDropdown"
import PlusIcon from "@/shared/assets/icon/plus/PlusIcon"
import {
  useSelectedGeneration,
  useSelectedGisuId,
} from "@/shared/hooks/useSelectedGisu"
import { Button } from "@/shared/ui/Button"
import { PageLabel } from "@/shared/ui/page-label/PageLabel"

export const Route = createFileRoute("/manage/school/")({
  component: SchoolManagePage,
})

const PAGE_SIZE = 20

function SchoolManagePage() {
  const [selectedChapter, setSelectedChapter] = useState<string>("all")
  const [sortOption, setSortOption] = useState<SchoolSortOption>("name")
  const [searchInputText, setSearchInputText] = useState("")
  const [submittedSearchQuery, setSubmittedSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)

  const handleSearchSubmit = () => {
    setSubmittedSearchQuery(searchInputText)
    setCurrentPage(1)
  }

  const { data: selectedGisuIdData } = useSelectedGisuId()
  const selectedGisuId = selectedGisuIdData ?? undefined
  const { data: selectedGeneration } = useSelectedGeneration()

  const { getChapterIdBySchool, getChapterIdByName } = useSchoolChapterMap({
    gisuId: selectedGisuId,
  })

  const chapterIdParam = useMemo(() => {
    if (selectedChapter === "all") return undefined
    const num = Number(selectedChapter)
    if (!Number.isNaN(num)) return num
    return getChapterIdByName(selectedChapter)
  }, [selectedChapter, getChapterIdByName])

  const isChapterUnresolved =
    selectedChapter !== "all" && chapterIdParam === undefined

  const {
    data: summaryData,
    isLoading: isSummaryLoading,
    isError: isSummaryError,
    error: summaryError,
  } = useAdminSchoolsSummary({
    gisuId: selectedGisuId,
    chapterId: chapterIdParam,
    search: submittedSearchQuery.trim() || undefined,
    page: currentPage - 1,
    size: PAGE_SIZE,
    sort: SCHOOL_SORT_SERVER_VALUES[sortOption],
    enabled: selectedGisuId != null && !isChapterUnresolved,
  })

  const isLoading = isSummaryLoading
  const summaryErrorStatus = isAxiosError(summaryError)
    ? summaryError.response?.status
    : undefined

  const paginatedSchools = useMemo(() => {
    if (!summaryData?.content) return []
    return summaryData.content
      .filter((item) => item.schoolId != null)
      .map((item) => {
        const fallbackChapterId = item.schoolName
          ? getChapterIdBySchool(item.schoolName)
          : undefined
        const chapterId = item.chapterId ?? fallbackChapterId
        return {
          id: String(item.schoolId),
          name: item.schoolName ?? "",
          chapterId,
          branch:
            item.chapterName ??
            (chapterId ? `지부 ${chapterId}` : "지부 미지정"),
          count: item.activeChallengerCount ?? 0,
        }
      })
  }, [summaryData, getChapterIdBySchool])

  const totalPages = Math.max(1, summaryData?.totalPages ?? 1)

  return (
    <div className="flex w-full max-w-244 flex-col gap-8">
      <PageLabel
        breadcrumb={[
          { id: "settings", label: "설정" },
          { id: "school", label: "학교 관리" },
        ]}
        title="학교 관리"
        description={
          selectedGeneration != null
            ? `UMC ${selectedGeneration}기 소속의 학교 정보를 관리합니다.`
            : "소속 학교 정보를 관리합니다."
        }
        className="pl-3"
      />

      <div className="flex w-full flex-col gap-6">
        <ChapterTabs
          gisuId={selectedGisuId}
          value={selectedChapter}
          onValueChange={(val) => {
            setSelectedChapter(val)
            setCurrentPage(1)
          }}
        />

        <div className="flex w-full items-center justify-between">
          <SchoolSearchInput
            value={searchInputText}
            onChange={(e) => setSearchInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSearchSubmit()
            }}
            onSearch={handleSearchSubmit}
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

        {isChapterUnresolved ? (
          <div className="text-body-1-medium text-teal-gray-400 py-12 text-center">
            선택한 지부 정보를 찾을 수 없거나 불러오는 중입니다.
          </div>
        ) : isLoading ? (
          <div className="text-body-1-medium text-teal-gray-400 py-12 text-center">
            학교 정보를 불러오는 중입니다...
          </div>
        ) : isSummaryError ? (
          <div className="text-body-1-medium text-teal-gray-400 py-12 text-center">
            {summaryErrorStatus === 403
              ? "선택한 기수의 학교 정보를 볼 권한이 없습니다. 해당 기수의 운영진만 조회할 수 있습니다."
              : "학교 정보를 불러오지 못했습니다. 잠시 후 다시 시도해주세요."}
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
