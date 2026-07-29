import { useMemo, useState } from "react"

import { useMe } from "@/entities/member/hooks/useMe"
import { isChapter } from "@/entities/organization/model/chapters"
import { PageLabel } from "@/shared/ui/page-label/PageLabel"

import { useRecruitingPermissions } from "../hooks/useRecruitingPermissions"
import { useRecruitingRounds } from "../hooks/useRecruitingRounds"
import {
  type ApplicantListFilters,
  DEFAULT_APPLICANT_LIST_FILTERS,
  formatBaseTime,
} from "../model/applicantListTypes"
import {
  EVALUATION_STAGE_DESCRIPTION,
  EVALUATION_STAGE_LABEL,
  EVALUATION_STAGE_SHORT_LABEL,
  type EvaluationStage,
} from "../model/evaluationStage"
import {
  formatGisuLabel,
  resolveViewerChapter,
  resolveViewerSchool,
} from "../model/recruitingRole"
import {
  applyScopeFilters,
  resolveRecruitingScope,
  resolveScopeTabs,
} from "../model/recruitingScope"
import { ApplicantFilterBar } from "./ApplicantFilterBar"
import { ChapterTabs } from "./ChapterTabs"
import { SchoolApplicantSection } from "./SchoolApplicantSection"
import { SchoolTabs } from "./SchoolTabs"

import type { RecruitingRoundGroup } from "../api/types"
import type { RecruitingScope } from "../model/recruitingScope"
import type { ApplicantColumnOptions } from "./applicantTableColumns"

const RESULT_FILTER_LABEL: Record<EvaluationStage, string> = {
  document: "서류 평가 결과",
  interview: "면접 평가 결과",
  final: "최종 평가 결과",
}

const SCHOOL_CARD_COLUMNS: ApplicantColumnOptions = {
  hideChapter: true,
  hideSchool: true,
}

function pageDescription(stage: EvaluationStage, scope: RecruitingScope) {
  const shortLabel = EVALUATION_STAGE_SHORT_LABEL[stage]
  if (scope.chapters.length === 1 && scope.schools.length > 1) {
    return `지부 ${shortLabel} 평가 현황을 확인하고, 내 학교 지원자를 평가합니다.`
  }
  if (scope.schools.length <= 1) {
    return `내 학교 지원자의 ${shortLabel} 평가 현황을 확인하고 평가합니다.`
  }
  return EVALUATION_STAGE_DESCRIPTION[stage]
}

interface ApplicantListPageProps {
  stage: EvaluationStage
}

export function ApplicantListPage({ stage }: ApplicantListPageProps) {
  const [filters, setFilters] = useState<ApplicantListFilters>(
    DEFAULT_APPLICANT_LIST_FILTERS,
  )

  const { data: me } = useMe()
  const { groups, generation, isLoading, isError } = useRecruitingRounds()

  const viewerChapter = resolveViewerChapter(me)
  const viewerSchool = resolveViewerSchool(me)

  const seasonIds = useMemo(
    () => groups.map((group) => String(group.seasonId)),
    [groups],
  )
  const {
    permittedSeasonIds,
    isLoading: isPermissionLoading,
    isError: isPermissionError,
  } = useRecruitingPermissions(seasonIds)

  const scope = useMemo(
    () => resolveRecruitingScope(groups, permittedSeasonIds, viewerSchool),
    [groups, permittedSeasonIds, viewerSchool],
  )
  const { showChapterTabs, showSchoolTabs } = resolveScopeTabs(scope)

  const scopedGroups = useMemo(
    () =>
      applyScopeFilters(
        scope,
        filters.chapterTab,
        filters.schoolTab,
        filters.chapters,
      ),
    [scope, filters.chapterTab, filters.schoolTab, filters.chapters],
  )

  const chapterGroups = useMemo(() => {
    const byChapter = new Map<string, RecruitingRoundGroup[]>()
    for (const group of scopedGroups) {
      const bucket = byChapter.get(group.chapterName) ?? []
      bucket.push(group)
      byChapter.set(group.chapterName, bucket)
    }
    return [...byChapter.entries()].map(([chapter, schools]) => ({
      chapter,
      schools,
    }))
  }, [scopedGroups])

  const handleFiltersChange = (partial: Partial<ApplicantListFilters>) => {
    setFilters((prev) => ({ ...prev, ...partial }))
  }

  const baseTime = formatBaseTime(new Date())
  const gisuLabel = formatGisuLabel(generation)
  const needsChapterPick =
    showChapterTabs &&
    filters.chapterTab === "all" &&
    filters.chapters.length === 0

  return (
    <div className="flex w-full max-w-286.5 flex-col">
      <PageLabel
        breadcrumb={[
          { id: "recruiting", label: "리크루팅" },
          { id: "evaluation-management", label: "평가 관리" },
          { id: stage, label: EVALUATION_STAGE_LABEL[stage] },
        ]}
        title={EVALUATION_STAGE_LABEL[stage]}
        description={pageDescription(stage, scope)}
        className="pl-3"
      />
      {showChapterTabs && (
        <ChapterTabs
          value={filters.chapterTab}
          onValueChange={(chapterTab) =>
            handleFiltersChange({ chapterTab, chapters: [], schools: [] })
          }
          className="mt-8"
        />
      )}
      {showSchoolTabs && (
        <SchoolTabs
          schools={scope.schools}
          value={filters.schoolTab}
          onValueChange={(schoolTab) =>
            handleFiltersChange({ schoolTab, schools: [] })
          }
          className="mt-8"
        />
      )}
      <ApplicantFilterBar
        filters={filters}
        onFiltersChange={handleFiltersChange}
        resultFilterLabel={RESULT_FILTER_LABEL[stage]}
        chapterScope={
          showSchoolTabs && isChapter(viewerChapter) ? viewerChapter : undefined
        }
        hideSchoolControls={!showChapterTabs && !showSchoolTabs}
        className="mt-6"
      />
      {gisuLabel && (
        <h2 className="text-heading-5-semibold mt-6 px-3 text-teal-700">
          {gisuLabel}
        </h2>
      )}
      {needsChapterPick ? (
        <EmptyNotice message="지부를 선택하면 해당 지부의 지원자를 확인할 수 있습니다." />
      ) : isLoading || isPermissionLoading ? (
        <EmptyNotice message="모집 정보를 불러오는 중입니다." />
      ) : isError ? (
        <EmptyNotice message="모집 정보를 불러오지 못했습니다. 잠시 후 다시 시도해주세요." />
      ) : isPermissionError ? (
        <EmptyNotice message="권한 정보를 불러오지 못했습니다. 잠시 후 다시 시도해주세요." />
      ) : scope.groups.length === 0 ? (
        <EmptyNotice message="조회할 수 있는 모집이 없습니다." />
      ) : chapterGroups.length === 0 ? (
        <EmptyNotice message="현재 등록된 모집 공고가 없습니다." />
      ) : (
        chapterGroups.map(({ chapter, schools }) => (
          <section key={chapter} className="flex flex-col">
            <h2 className="text-heading-5-semibold mt-6 px-3 text-teal-700">
              {chapter}
            </h2>
            {schools.map((group) => (
              <SchoolApplicantSection
                key={`${group.schoolId}-${group.seasonId}`}
                group={group}
                stage={stage}
                filters={filters}
                baseTime={baseTime}
                columns={SCHOOL_CARD_COLUMNS}
                className="mt-4"
              />
            ))}
          </section>
        ))
      )}
    </div>
  )
}

function EmptyNotice({ message }: { message: string }) {
  return (
    <div className="border-teal-gray-100 text-body-2-regular text-teal-gray-500 mt-4 flex min-h-50 items-center justify-center rounded-[12px] border bg-white">
      {message}
    </div>
  )
}
