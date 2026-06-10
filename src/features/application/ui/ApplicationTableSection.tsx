import { Search } from "lucide-react"
import { useCallback, useMemo, useState } from "react"

import {
  FilterDropdown,
  type FilterDropdownProps,
} from "@/features/project/list/ui/FilterDropDown"
import { cn } from "@/shared/lib/utils"
import { Pagination } from "@/shared/ui/Pagination"

import { ApplicantDetailRow } from "./ApplicantDetailRow"
import { ApplicantTableHead } from "./ApplicantTableHead"
import { ApplicationDetailModal } from "./ApplicationDetailModal"
import { ProjectStatusRow } from "./ProjectStatusRow"

import type { ApplicantDetail, ProjectApplication } from "../model/types"

const ITEMS_PER_PAGE = 15

const SCHOOL_OPTIONS = [
  { value: "all", label: "전체" },
  { value: "서경대", label: "서경대" },
  { value: "성신여대", label: "성신여대" },
  { value: "숭실대", label: "숭실대" },
  { value: "안양대", label: "안양대" },
  { value: "한양대 ERICA", label: "한양대 ERICA" },
]

const PART_OPTIONS = [
  { value: "all", label: "전체" },
  { value: "plan", label: "Plan" },
  { value: "web", label: "Web" },
  { value: "ios", label: "iOS" },
  { value: "android", label: "Android" },
  { value: "springboot", label: "Spring Boot" },
  { value: "nodejs", label: "Node.js" },
]

const ROUND_OPTIONS = [
  { value: "all", label: "전체" },
  { value: "1", label: "1차" },
  { value: "2", label: "2차" },
  { value: "3", label: "3차" },
]

const RECRUIT_STATUS_OPTIONS = [
  { value: "all", label: "전체" },
  { value: "모집 중", label: "모집 중" },
  { value: "모집 완료", label: "모집 완료" },
]

const APPLICATION_STATUS_OPTIONS = [
  { value: "all", label: "전체" },
  { value: "pass", label: "합격" },
  { value: "fail", label: "불합격" },
  { value: "pending", label: "대기" },
]

type FilterName = "round" | "part" | "school" | "recruit" | "appStatus"

interface ApplicationTableSectionProps {
  projects: ProjectApplication[]
  searchPlaceholder?: string
  visibleFilters?: FilterName[]
  /** 현재 활성 차수 (이전 차수의 상태 칩 disabled 처리) */
  currentRound?: number
  /** 현재 선택된 챕터 이름 (상세 모달 전달용) */
  chapterName?: string
  /** true이면 상세 모달에서 합불 변경 불가 */
  readOnly?: boolean
  className?: string
}

const DEFAULT_FILTERS: FilterName[] = [
  "school",
  "part",
  "round",
  "recruit",
  "appStatus",
]

export function ApplicationTableSection({
  projects,
  searchPlaceholder = "프로젝트 명으로 검색하세요.",
  visibleFilters = DEFAULT_FILTERS,
  currentRound,
  chapterName,
  readOnly = false,
  className,
}: ApplicationTableSectionProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())
  const [currentPage, setCurrentPage] = useState(1)

  // 상세 모달 상태
  const [detailModalOpen, setDetailModalOpen] = useState(false)
  const [selectedProject, setSelectedProject] =
    useState<ProjectApplication | null>(null)

  // 필터 상태
  const [openFilter, setOpenFilter] = useState<string | null>(null)
  const [schoolFilter, setSchoolFilter] = useState("all")
  const [partFilter, setPartFilter] = useState("all")
  const [roundFilter, setRoundFilter] = useState("all")
  const [recruitFilter, setRecruitFilter] = useState("all")
  const [appStatusFilter, setAppStatusFilter] = useState("all")

  const toggleExpand = useCallback((id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const hasExpanded = expandedIds.size > 0

  const toggleFilter = useCallback((name: string) => {
    setOpenFilter((prev) => (prev === name ? null : name))
  }, [])

  const closeFilter = useCallback(() => setOpenFilter(null), [])

  // 프로젝트 필터링
  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      if (
        searchQuery &&
        !p.projectName.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false
      }
      if (recruitFilter !== "all" && p.statusLabel !== recruitFilter) {
        return false
      }
      return true
    })
  }, [projects, searchQuery, recruitFilter])

  const totalPages = Math.max(
    1,
    Math.ceil(filteredProjects.length / ITEMS_PER_PAGE),
  )
  const pagedProjects = filteredProjects.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  )

  const toggleAll = useCallback(() => {
    if (hasExpanded) {
      setExpandedIds(new Set())
    } else {
      setExpandedIds(new Set(pagedProjects.map((p) => p.id)))
    }
  }, [hasExpanded, pagedProjects])

  // 펼친 행 내 지원자 필터링
  const filterApplicants = useCallback(
    (applicants: ApplicantDetail[]) => {
      return applicants.filter((a) => {
        if (partFilter !== "all" && a.role !== partFilter) return false
        if (roundFilter !== "all" && a.round !== Number(roundFilter))
          return false
        if (appStatusFilter !== "all" && a.status !== appStatusFilter)
          return false
        if (schoolFilter !== "all" && a.university !== schoolFilter)
          return false
        return true
      })
    },
    [partFilter, roundFilter, appStatusFilter, schoolFilter],
  )

  const filters: (FilterDropdownProps & { name: string })[] = useMemo(
    () => [
      {
        name: "school",
        label: "학교",
        options: SCHOOL_OPTIONS,
        selectedValue: schoolFilter === "all" ? undefined : schoolFilter,
        open: openFilter === "school",
        onClick: () => toggleFilter("school"),
        onSelect: (v: string) => {
          setSchoolFilter(v)
          setCurrentPage(1)
        },
        onRequestClose: closeFilter,
        className: "min-w-0",
      },
      {
        name: "part",
        label: "파트",
        options: PART_OPTIONS,
        selectedValue: partFilter === "all" ? undefined : partFilter,
        open: openFilter === "part",
        onClick: () => toggleFilter("part"),
        onSelect: (v: string) => {
          setPartFilter(v)
          setCurrentPage(1)
        },
        onRequestClose: closeFilter,
        className: "min-w-0",
      },
      {
        name: "round",
        label: "차수",
        options: ROUND_OPTIONS,
        selectedValue: roundFilter === "all" ? undefined : roundFilter,
        open: openFilter === "round",
        onClick: () => toggleFilter("round"),
        onSelect: (v: string) => {
          setRoundFilter(v)
          setCurrentPage(1)
        },
        onRequestClose: closeFilter,
        className: "min-w-0",
      },
      {
        name: "recruit",
        label: "모집 상태",
        options: RECRUIT_STATUS_OPTIONS,
        selectedValue: recruitFilter === "all" ? undefined : recruitFilter,
        open: openFilter === "recruit",
        onClick: () => toggleFilter("recruit"),
        onSelect: (v: string) => {
          setRecruitFilter(v)
          setCurrentPage(1)
        },
        onRequestClose: closeFilter,
        className: "min-w-0",
      },
      {
        name: "appStatus",
        label: "지원 상태",
        options: APPLICATION_STATUS_OPTIONS,
        selectedValue: appStatusFilter === "all" ? undefined : appStatusFilter,
        open: openFilter === "appStatus",
        onClick: () => toggleFilter("appStatus"),
        onSelect: (v: string) => {
          setAppStatusFilter(v)
          setCurrentPage(1)
        },
        onRequestClose: closeFilter,
        className: "min-w-0",
      },
    ],
    [
      schoolFilter,
      partFilter,
      roundFilter,
      recruitFilter,
      appStatusFilter,
      openFilter,
      toggleFilter,
      closeFilter,
    ],
  )

  return (
    <div className={cn("flex flex-col gap-6", className)}>
      {/* 섹션 헤더 */}
      <h2 className="text-heading-6-semibold text-teal-700">02 지원자 목록</h2>

      {/* 검색 + 필터 */}
      <div className="flex items-center justify-between">
        <div className="shadow-inner-neutral-2 bg-teal-gray-100 flex h-11 w-[456px] items-center gap-2 rounded-xl px-4">
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setCurrentPage(1)
            }}
            className="text-body-2-regular text-teal-gray-900 placeholder:text-teal-gray-400 min-w-0 flex-1 bg-transparent outline-none"
          />
          <Search size={24} className="text-teal-gray-400 shrink-0" />
        </div>
        <div className="flex items-center gap-2">
          {visibleFilters
            .map((name) => filters.find((f) => f.name === name))
            .filter(Boolean)
            .map((f) => (
              <FilterDropdown key={f!.name} {...f!} />
            ))}
        </div>
      </div>

      {/* 테이블 */}
      <div role="table" className="flex flex-col">
        <ApplicantTableHead hasExpanded={hasExpanded} onToggleAll={toggleAll} />

        {pagedProjects.map((project) => {
          const isExpanded = expandedIds.has(project.id)
          const applicants = filterApplicants(project.applicants)

          return (
            <div key={project.id}>
              <ProjectStatusRow
                projectName={project.projectName}
                role={project.role}
                challengerName={project.challengerName}
                challengerUniversity={project.challengerUniversity}
                statusLabel={project.statusLabel}
                designCount={project.designCount}
                feCount={project.feCount}
                beCount={project.beCount}
                isExpanded={isExpanded}
                onToggleExpand={() => toggleExpand(project.id)}
                onProjectClick={() => {
                  setSelectedProject(project)
                  setDetailModalOpen(true)
                }}
              />

              {isExpanded && applicants.length > 0 && (
                <div className="border-teal-gray-150 border-b-[3px] py-1">
                  {applicants.map((applicant) => (
                    <ApplicantDetailRow
                      key={applicant.id}
                      round={applicant.round}
                      role={applicant.role}
                      name={applicant.name}
                      university={applicant.university}
                      status={applicant.status}
                      processedAt={applicant.processedAt}
                      appliedAt={applicant.appliedAt}
                    />
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* 페이지네이션 */}
      <div className="flex justify-center pt-2">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* 지원 현황 상세 모달 */}
      {selectedProject && (
        <ApplicationDetailModal
          project={selectedProject}
          chapterName={chapterName ?? ""}
          open={detailModalOpen}
          onOpenChange={setDetailModalOpen}
          currentRound={currentRound}
          readOnly={readOnly}
        />
      )}
    </div>
  )
}
