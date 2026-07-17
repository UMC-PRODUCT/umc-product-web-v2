import { useMemo, useState } from "react"

import RightChevronIcon from "@/shared/assets/icon/chevron/RightChevronIcon"

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
      <nav aria-label="breadcrumb" className="flex items-center gap-1 pl-3">
        {["리크루팅", "평가 관리", EVALUATION_STAGE_LABEL[stage]].map(
          (crumb, index) => (
            <span key={crumb} className="flex items-center gap-1">
              {index > 0 && (
                <RightChevronIcon className="text-teal-gray-400 size-4" />
              )}
              <span className="text-body-2-medium text-teal-gray-400">
                {crumb}
              </span>
            </span>
          ),
        )}
      </nav>
      <div className="mt-6.5 flex flex-col gap-3 pl-3">
        <h1 className="text-heading-5-semibold text-teal-gray-900">
          {EVALUATION_STAGE_LABEL[stage]}
        </h1>
        <p className="text-body-2-regular text-teal-gray-600">
          {EVALUATION_STAGE_DESCRIPTION[stage]}
        </p>
      </div>
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
