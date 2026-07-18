import { useMemo, useState } from "react"

import { SCHOOLS_BY_BRANCH } from "@/shared/config/schools"
import { PageLabel } from "@/shared/ui/page-label/PageLabel"

import {
  APPLICANT_LIST_BASE_TIME_MOCK,
  APPLICANT_LIST_MOCK,
  RECRUITING_MY_CHAPTER_MOCK,
  RECRUITING_MY_SCHOOL_MOCK,
  RECRUITING_TARGET_GISU_LABEL_MOCK,
} from "../model/applicantList.mock"
import {
  type ApplicantListFilters,
  applyApplicantFilters,
  DEFAULT_APPLICANT_LIST_FILTERS,
  formatBaseTime,
  getStageEvaluation,
} from "../model/applicantListTypes"
import {
  groupRowsByChapter,
  groupRowsBySchool,
  resolveApplicantListViewKind,
  resolveScopeChapters,
} from "../model/applicantListView"
import {
  EVALUATION_STAGE_DESCRIPTION,
  EVALUATION_STAGE_LABEL,
  EVALUATION_STAGE_SHORT_LABEL,
  type EvaluationStage,
} from "../model/evaluationStage"
import { ApplicantFilterBar } from "./ApplicantFilterBar"
import { ApplicantTableCard } from "./ApplicantTableCard"
import { ChapterTabs } from "./ChapterTabs"
import { SchoolTabs } from "./SchoolTabs"

import type { RecruitingListRole } from "../model/recruitingListRole"
import type { ApplicantColumnOptions } from "./applicantTableColumns"

const RESULT_FILTER_LABEL: Record<EvaluationStage, string> = {
  document: "서류 평가 결과",
  interview: "면접 평가 결과",
  final: "최종 평가 결과",
}

const CHAPTER_CARD_COLUMNS: ApplicantColumnOptions = { hideChapter: true }

function pageDescription(stage: EvaluationStage, role: RecruitingListRole) {
  const shortLabel = EVALUATION_STAGE_SHORT_LABEL[stage]
  if (role === "chapterAdmin") {
    return `지부 ${shortLabel} 평가 현황을 확인하고, 내 학교 지원자를 평가합니다.`
  }
  if (role === "schoolStaff") {
    return `내 학교 지원자의 ${shortLabel} 평가 현황을 확인하고 평가합니다.`
  }
  return EVALUATION_STAGE_DESCRIPTION[stage]
}

interface ApplicantListPageProps {
  stage: EvaluationStage
  role?: RecruitingListRole
  useMockData?: boolean
  hasRecruitment?: boolean
}

export function ApplicantListPage({
  stage,
  role = "central",
  useMockData = false,
  hasRecruitment = true,
}: ApplicantListPageProps) {
  const [filters, setFilters] = useState<ApplicantListFilters>(
    DEFAULT_APPLICANT_LIST_FILTERS,
  )

  const rows = useMemo(() => {
    const base = useMockData ? APPLICANT_LIST_MOCK : []
    if (role === "chapterAdmin") {
      return base.filter((row) => row.chapter === RECRUITING_MY_CHAPTER_MOCK)
    }
    if (role === "schoolStaff") {
      return base.filter((row) => row.school === RECRUITING_MY_SCHOOL_MOCK)
    }
    return base
  }, [useMockData, role])

  const allStageRows = useMemo(
    () => rows.filter((row) => getStageEvaluation(row, stage)),
    [rows, stage],
  )
  const visibleRows = useMemo(
    () => applyApplicantFilters(rows, filters, stage),
    [rows, filters, stage],
  )

  const viewKind =
    role === "central" ? resolveApplicantListViewKind(filters) : "schoolGroups"
  const scopeChapters =
    role === "central"
      ? resolveScopeChapters(filters)
      : [RECRUITING_MY_CHAPTER_MOCK]

  const baseTime = useMockData
    ? APPLICANT_LIST_BASE_TIME_MOCK
    : formatBaseTime(new Date())

  const handleFiltersChange = (partial: Partial<ApplicantListFilters>) => {
    setFilters((prev) => ({ ...prev, ...partial }))
  }

  const schoolCardColumns = useMemo<ApplicantColumnOptions>(
    () => ({
      hideChapter: true,
      hideSchool: true,
      showMyEvaluation: role === "schoolStaff" && filters.assignedOnly,
    }),
    [role, filters.assignedOnly],
  )

  const chapterGroups =
    viewKind === "chapterGroups"
      ? groupRowsByChapter(visibleRows, scopeChapters)
      : []
  const schoolGroups =
    viewKind === "schoolGroups"
      ? groupRowsBySchool(visibleRows, scopeChapters)
      : []
  const hasGroups =
    viewKind === "chapterGroups"
      ? chapterGroups.length > 0
      : viewKind === "schoolGroups"
        ? schoolGroups.length > 0
        : false

  const emptyScopedSchool =
    role !== "central" && !hasGroups
      ? role === "schoolStaff"
        ? RECRUITING_MY_SCHOOL_MOCK
        : filters.schoolTab !== "all"
          ? filters.schoolTab
          : undefined
      : undefined
  const showScopedEmptyCard = role !== "central" && !hasGroups
  const emptyScopedAllStageRows = emptyScopedSchool
    ? allStageRows.filter((row) => row.school === emptyScopedSchool)
    : allStageRows

  return (
    <div className="flex w-full max-w-286.5 flex-col">
      <PageLabel
        breadcrumb={[
          { id: "recruiting", label: "리크루팅" },
          { id: "evaluation-management", label: "평가 관리" },
          { id: stage, label: EVALUATION_STAGE_LABEL[stage] },
        ]}
        title={EVALUATION_STAGE_LABEL[stage]}
        description={pageDescription(stage, role)}
        className="pl-3"
      />
      {role === "central" && (
        <ChapterTabs
          value={filters.chapterTab}
          onValueChange={(chapterTab) =>
            handleFiltersChange({ chapterTab, chapters: [], schools: [] })
          }
          className="mt-8"
        />
      )}
      {role === "chapterAdmin" && (
        <SchoolTabs
          schools={SCHOOLS_BY_BRANCH[RECRUITING_MY_CHAPTER_MOCK]}
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
          role === "chapterAdmin" ? RECRUITING_MY_CHAPTER_MOCK : undefined
        }
        hideSchoolControls={role === "schoolStaff"}
        showAssignedToggle={role === "schoolStaff"}
        className="mt-6"
      />
      {(viewKind === "single" || !hasGroups) && !showScopedEmptyCard && (
        <>
          <h2 className="text-heading-5-semibold mt-6 px-3 text-teal-700">
            {RECRUITING_TARGET_GISU_LABEL_MOCK}
          </h2>
          <ApplicantTableCard
            visibleRows={viewKind === "single" ? visibleRows : []}
            allStageRows={allStageRows}
            stage={stage}
            baseTime={baseTime}
            hasRecruitment={hasRecruitment}
            className="mt-4"
          />
        </>
      )}
      {showScopedEmptyCard && (
        <section className="flex flex-col">
          <h2 className="text-heading-5-semibold mt-6 px-3 text-teal-700">
            {RECRUITING_MY_CHAPTER_MOCK}
          </h2>
          <ApplicantTableCard
            visibleRows={[]}
            allStageRows={emptyScopedAllStageRows}
            stage={stage}
            baseTime={baseTime}
            titleBase={emptyScopedSchool}
            columns={schoolCardColumns}
            hasRecruitment={hasRecruitment}
            className="mt-4"
          />
        </section>
      )}
      {viewKind === "chapterGroups" &&
        chapterGroups.map(({ chapter, rows: chapterRows }) => (
          <section key={chapter} className="flex flex-col">
            <h2 className="text-heading-5-semibold mt-6 px-3 text-teal-700">
              {chapter}
            </h2>
            <ApplicantTableCard
              visibleRows={chapterRows}
              allStageRows={allStageRows.filter(
                (row) => row.chapter === chapter,
              )}
              stage={stage}
              baseTime={baseTime}
              columns={CHAPTER_CARD_COLUMNS}
              className="mt-4"
            />
          </section>
        ))}
      {viewKind === "schoolGroups" &&
        schoolGroups.map(({ chapter, schools }) => (
          <section key={chapter} className="flex flex-col">
            <h2 className="text-heading-5-semibold mt-6 px-3 text-teal-700">
              {chapter}
            </h2>
            {schools.map(({ school, rows: schoolRows }) => (
              <ApplicantTableCard
                key={school}
                visibleRows={schoolRows}
                allStageRows={allStageRows.filter(
                  (row) => row.school === school,
                )}
                stage={stage}
                baseTime={baseTime}
                titleBase={school}
                columns={schoolCardColumns}
                className="mt-4"
              />
            ))}
          </section>
        ))}
    </div>
  )
}
