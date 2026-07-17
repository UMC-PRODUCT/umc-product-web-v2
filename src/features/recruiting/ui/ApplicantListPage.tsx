import { useMemo, useState } from "react"

import { PageLabel } from "@/shared/ui/page-label/PageLabel"

import {
  APPLICANT_LIST_BASE_TIME_MOCK,
  APPLICANT_LIST_MOCK,
  RECRUITING_TARGET_GISU_LABEL_MOCK,
} from "../model/applicantList.mock"
import {
  type ApplicantListFilters,
  applyApplicantFilters,
  DEFAULT_APPLICANT_LIST_FILTERS,
  formatBaseTime,
} from "../model/applicantListTypes"
import {
  EVALUATION_STAGE_DESCRIPTION,
  EVALUATION_STAGE_LABEL,
  type EvaluationStage,
} from "../model/evaluationStage"
import { ApplicantFilterBar } from "./ApplicantFilterBar"
import { ApplicantTableCard } from "./ApplicantTableCard"
import { ChapterTabs } from "./ChapterTabs"

const RESULT_FILTER_LABEL: Record<EvaluationStage, string> = {
  document: "서류 평가 결과",
  interview: "면접 평가 결과",
  final: "최종 평가 결과",
}

interface ApplicantListPageProps {
  stage: EvaluationStage
  useMockData?: boolean
}

export function ApplicantListPage({
  stage,
  useMockData = false,
}: ApplicantListPageProps) {
  const [filters, setFilters] = useState<ApplicantListFilters>(
    DEFAULT_APPLICANT_LIST_FILTERS,
  )

  const rows = useMemo(
    () => (useMockData ? APPLICANT_LIST_MOCK : []),
    [useMockData],
  )
  const filteredRows = useMemo(
    () => applyApplicantFilters(rows, filters, stage),
    [rows, filters, stage],
  )

  const baseTime = useMockData
    ? APPLICANT_LIST_BASE_TIME_MOCK
    : formatBaseTime(new Date())

  const handleFiltersChange = (partial: Partial<ApplicantListFilters>) => {
    setFilters((prev) => ({ ...prev, ...partial }))
  }

  return (
    <div className="flex w-full max-w-286.5 flex-col">
      <PageLabel
        breadcrumb={["리크루팅", "평가 관리", EVALUATION_STAGE_LABEL[stage]]}
        title={EVALUATION_STAGE_LABEL[stage]}
        description={EVALUATION_STAGE_DESCRIPTION[stage]}
      />
      <ChapterTabs
        value={filters.chapterTab}
        onValueChange={(chapterTab) =>
          handleFiltersChange({ chapterTab, chapters: [], schools: [] })
        }
        className="mt-8"
      />
      <ApplicantFilterBar
        filters={filters}
        onFiltersChange={handleFiltersChange}
        resultFilterLabel={RESULT_FILTER_LABEL[stage]}
        className="mt-6"
      />
      <h2 className="text-heading-5-semibold mt-6 px-3 text-teal-700">
        {RECRUITING_TARGET_GISU_LABEL_MOCK}
      </h2>
      <ApplicantTableCard
        rows={filteredRows}
        stage={stage}
        totalCount={filteredRows.length}
        baseTime={baseTime}
        filters={filters}
        onFiltersChange={handleFiltersChange}
        className="mt-4"
      />
    </div>
  )
}
