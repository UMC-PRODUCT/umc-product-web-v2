import { Search } from "lucide-react"
import { useCallback, useMemo, useState } from "react"

import {
  FilterDropdown,
  type FilterDropdownProps,
} from "@/features/project/list/ui/FilterDropDown"
import { SectionHeader } from "@/features/project/new/ui/shared/SectionHeader"
import { cn } from "@/shared/lib/utils"
import { Pagination } from "@/shared/ui/Pagination"

import { shortenSchoolName } from "../model/mappers"
import { ApplicantDetailRow } from "./ApplicantDetailRow"
import { ApplicantTableHead } from "./ApplicantTableHead"
import { ApplicationDetailModal } from "./ApplicationDetailModal"
import { ProjectStatusRow } from "./ProjectStatusRow"

import type { ProjectApplication } from "../model/types"

const ITEMS_PER_PAGE = 15

function buildSchoolOptions(projects: ProjectApplication[]) {
  const schools = new Set<string>()
  for (const p of projects) {
    // PM 학교도 포함
    if (p.challengerUniversity) schools.add(p.challengerUniversity)
    for (const a of p.applicants) {
      if (a.university) schools.add(a.university)
    }
  }
  const sorted = [...schools].sort((a, b) => a.localeCompare(b, "ko"))
  return sorted.map((s) => ({ value: s, label: shortenSchoolName(s) }))
}

function buildMultiSelectLabel(
  selected: string[],
  options: { value: string; label: string }[],
): string | undefined {
  if (selected.length === 0) return undefined
  const first =
    options.find((o) => o.value === selected[0])?.label ?? selected[0]
  if (selected.length === 1) return first
  return `${first} 외 ${selected.length - 1}`
}

const PART_OPTIONS = [
  { value: "web", label: "Web" },
  { value: "ios", label: "iOS" },
  { value: "android", label: "Android" },
  { value: "springboot", label: "Spring Boot" },
  { value: "nodejs", label: "Node.js" },
]

const RECRUIT_STATUS_OPTIONS = [
  { value: "all", label: "전체" },
  { value: "recruiting", label: "모집 중" },
  { value: "done", label: "모집 완료" },
]

type FilterName = "part" | "school" | "recruit"

interface ApplicationTableSectionProps {
  projects: ProjectApplication[]
  searchPlaceholder?: string
  visibleFilters?: FilterName[]
  /** 현재 활성 차수 (이전 차수의 상태 칩 disabled 처리) */
  currentRound?: number
  /** 현재 선택된 챕터 이름 (상세 모달 전달용) */
  chapterName?: string
  /** APPLY-102 단건 상세 권한 없는 역할(SCHOOL_PRESIDENT 등)일 때 true - 모달은 열리지만 폼 패널 비활성 */
  disableFormPanel?: boolean
  /** 플랜 챌린저(PM) 뷰: 대기 상태 옵션 숨김 */
  hidePendingStatus?: boolean
  /** 지원자 펼치기 버튼 숨김 (SCHOOL_PRESIDENT 등 열람 제한 역할) */
  hideExpand?: boolean
  disableProjectModal?: boolean
  className?: string
}

const DEFAULT_FILTERS: FilterName[] = ["school", "part", "recruit"]

export function ApplicationTableSection({
  projects,
  searchPlaceholder = "프로젝트 명으로 검색하세요.",
  visibleFilters = DEFAULT_FILTERS,
  currentRound,
  chapterName,
  disableFormPanel = false,
  hidePendingStatus = false,
  hideExpand = false,
  disableProjectModal = false,
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
  const [schoolFilter, setSchoolFilter] = useState<string[]>([])
  const [partFilter, setPartFilter] = useState<string[]>([])
  const [recruitFilter, setRecruitFilter] = useState("all")

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

  // 프로젝트 필터링 (파트/학교도 프로젝트 행 레벨에서 처리)
  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      if (
        searchQuery &&
        !p.projectName.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false
      }
      if (recruitFilter !== "all") {
        const match =
          recruitFilter === "recruiting"
            ? p.statusLabel === "모집 중"
            : p.statusLabel === "모집 완료"
        if (!match) return false
      }
      // 파트 필터: 프로젝트에 해당 파트가 있어야 함
      if (
        partFilter.length > 0 &&
        !p.parts.some((r) => partFilter.includes(r))
      ) {
        return false
      }
      // 학교 필터: PM 또는 지원자 중 한 명이라도 해당 학교면 표시
      if (schoolFilter.length > 0) {
        const projectSchools = new Set([
          p.challengerUniversity,
          ...p.applicants.map((a) => a.university),
        ])
        if (!schoolFilter.some((s) => projectSchools.has(s))) return false
      }
      return true
    })
  }, [projects, searchQuery, recruitFilter, partFilter, schoolFilter])

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

  const schoolOptions = useMemo(() => buildSchoolOptions(projects), [projects])

  const filters: (FilterDropdownProps & { name: string })[] = useMemo(
    () => [
      {
        name: "school",
        label: "학교",
        options: schoolOptions,
        multiSelect: true,
        selectedValues: schoolFilter,
        selectedLabel: buildMultiSelectLabel(schoolFilter, schoolOptions),
        open: openFilter === "school",
        onClick: () => toggleFilter("school"),
        onSelect: (v: string) => {
          setSchoolFilter((prev) => {
            const next = prev.includes(v)
              ? prev.filter((s) => s !== v)
              : [...prev, v]
            return next
          })
          setCurrentPage(1)
        },
        onRequestClose: closeFilter,
        className: schoolFilter.length > 0 ? "w-fit" : "w-20",
        dropdownClassName: "!min-w-[156px] w-[156px]",
      },
      {
        name: "part",
        label: "파트",
        options: PART_OPTIONS,
        multiSelect: true,
        selectedValues: partFilter,
        selectedLabel: buildMultiSelectLabel(partFilter, PART_OPTIONS),
        open: openFilter === "part",
        onClick: () => toggleFilter("part"),
        onSelect: (v: string) => {
          setPartFilter((prev) =>
            prev.includes(v) ? prev.filter((s) => s !== v) : [...prev, v],
          )
          setCurrentPage(1)
        },
        onRequestClose: closeFilter,
        className: partFilter.length > 0 ? "w-fit" : "w-20",
        dropdownClassName: "!min-w-[152px] w-[152px]",
      },
      {
        name: "recruit",
        label: "모집 상태",
        options: RECRUIT_STATUS_OPTIONS,
        selectedValue: recruitFilter === "all" ? undefined : recruitFilter,
        selectedLabel:
          recruitFilter === "all"
            ? undefined
            : RECRUIT_STATUS_OPTIONS.find((o) => o.value === recruitFilter)
                ?.label,
        open: openFilter === "recruit",
        onClick: () => toggleFilter("recruit"),
        onSelect: (v: string) => {
          setRecruitFilter(v)
          setCurrentPage(1)
        },
        onRequestClose: closeFilter,
        className: "w-fit",
        dropdownClassName: "!min-w-[114px] w-[114px]",
      },
    ],
    [
      schoolOptions,
      schoolFilter,
      partFilter,
      recruitFilter,
      openFilter,
      toggleFilter,
      closeFilter,
    ],
  )

  return (
    <div className={cn("flex flex-col gap-6", className)}>
      {/* 섹션 헤더 */}
      <SectionHeader index={2} title="지원자 목록" level={2} />

      {/* 검색 + 필터 */}
      <div className="flex items-center justify-between">
        <div className="shadow-inner-neutral-2 bg-teal-gray-100 flex h-11 w-114 items-center gap-2 rounded-xl px-4">
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
        <ApplicantTableHead
          hasExpanded={hasExpanded}
          onToggleAll={toggleAll}
          hideExpandButton={hideExpand}
        />

        {pagedProjects.length === 0 && (
          <div className="border-teal-gray-100 flex min-h-18 items-center justify-center rounded-b-[12px] border-r border-b border-l">
            <p className="text-body-2-medium text-teal-gray-300">
              등록된 프로젝트와 지원자가 없습니다
            </p>
          </div>
        )}

        {pagedProjects.map((project) => {
          const isExpanded = expandedIds.has(project.id)

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
                onToggleExpand={
                  hideExpand ? undefined : () => toggleExpand(project.id)
                }
                onProjectClick={
                  disableProjectModal
                    ? undefined
                    : () => {
                        setSelectedProject(project)
                        setDetailModalOpen(true)
                      }
                }
                hideExpandButton={hideExpand}
              />

              {isExpanded &&
                (project.applicants.length > 0 ? (
                  <div className="border-teal-gray-150 py-1">
                    {project.applicants.map((applicant) => (
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
                ) : (
                  <div className="border-teal-gray-150 flex h-17 items-center justify-center">
                    <p className="text-body-2-medium text-teal-gray-400">
                      아직 지원자가 없습니다
                    </p>
                  </div>
                ))}
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
          disableFormPanel={disableFormPanel}
          hidePendingStatus={hidePendingStatus}
        />
      )}
    </div>
  )
}
