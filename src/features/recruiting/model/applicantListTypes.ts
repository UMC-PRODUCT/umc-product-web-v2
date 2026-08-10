import type { PartTag } from "@/shared/model/domain"

import type { EvaluationStage } from "./evaluationStage"

export type RecruitmentType = "regular" | "additional"

export type EvaluationProgress = "before" | "inProgress" | "done"

export type EvaluationResult = "pass" | "fail"

export interface StageEvaluation {
  progress: EvaluationProgress
  result: EvaluationResult | null
  myProgress: EvaluationProgress
}

export interface ApplicantRow {
  applicationId: string
  roundId: string
  appliedAt: string
  applicantName: string
  chapter: string
  school: string
  recruitmentType: RecruitmentType
  additionalRound?: number
  parts: PartTag[]
  evaluations: {
    document: StageEvaluation
    interview: StageEvaluation | null
    final: StageEvaluation | null
  }
}

export function getStageEvaluation(row: ApplicantRow, stage: EvaluationStage) {
  return row.evaluations[stage]
}

export const EVALUATION_PROGRESS_LABEL: Record<EvaluationProgress, string> = {
  before: "평가 전",
  inProgress: "평가 중",
  done: "완료",
}

export const APPLICANT_SORT_OPTIONS = [
  { value: "latest", label: "최신 순" },
  { value: "registered", label: "등록 순" },
] as const

export type ApplicantSort = (typeof APPLICANT_SORT_OPTIONS)[number]["value"]

export const APPLICANT_ORDER_OPTIONS = [
  { value: "school", label: "학교순" },
  { value: "progress", label: "평가 상태 순" },
  { value: "result", label: "평가 결과 순" },
] as const

export type ApplicantOrder = (typeof APPLICANT_ORDER_OPTIONS)[number]["value"]

export interface ApplicantListFilters {
  search: string
  chapterTab: string
  schoolTab: string
  chapters: string[]
  schools: string[]
  parts: string[]
  progresses: string[]
  results: string[]
}

export const DEFAULT_APPLICANT_LIST_FILTERS: ApplicantListFilters = {
  search: "",
  chapterTab: "all",
  schoolTab: "all",
  chapters: [],
  schools: [],
  parts: [],
  progresses: [],
  results: [],
}

export interface ApplicantCardFilters {
  includeRegular: boolean
  includeAdditional: boolean
  sort: ApplicantSort
  order: ApplicantOrder | ""
}

export const DEFAULT_APPLICANT_CARD_FILTERS: ApplicantCardFilters = {
  includeRegular: true,
  includeAdditional: true,
  sort: "latest",
  order: "",
}

export function formatRecruitmentType(row: ApplicantRow) {
  if (row.recruitmentType === "regular") return "정규"
  return `${row.additionalRound ?? 2}차 추가`
}

export function formatAppliedAtParts(appliedAt: string) {
  const date = new Date(appliedAt)
  const pad = (value: number) => String(value).padStart(2, "0")
  return {
    date: `${pad(date.getMonth() + 1)}/${pad(date.getDate())}`,
    time: `${pad(date.getHours())}:${pad(date.getMinutes())}`,
  }
}

export function formatBaseTime(date: Date) {
  const pad = (value: number) => String(value).padStart(2, "0")
  return `${String(date.getFullYear()).slice(2)}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`
}

const PROGRESS_ORDER_RANK: Record<EvaluationProgress, number> = {
  before: 0,
  inProgress: 1,
  done: 2,
}

function resultOrderRank(result: EvaluationResult | null) {
  if (result === "pass") return 0
  if (result === "fail") return 1
  return 2
}

function matchesResultFilter(evaluation: StageEvaluation, results: string[]) {
  if (results.length === 0) return true
  return evaluation.result !== null && results.includes(evaluation.result)
}

function compareByOrder(
  a: ApplicantRow,
  b: ApplicantRow,
  aEvaluation: StageEvaluation,
  bEvaluation: StageEvaluation,
  order: ApplicantOrder,
) {
  if (order === "school") return a.school.localeCompare(b.school, "ko")
  if (order === "progress") {
    return (
      PROGRESS_ORDER_RANK[aEvaluation.progress] -
      PROGRESS_ORDER_RANK[bEvaluation.progress]
    )
  }
  return (
    resultOrderRank(aEvaluation.result) - resultOrderRank(bEvaluation.result)
  )
}

function scopeRowsToStage(rows: ApplicantRow[], stage: EvaluationStage) {
  return rows.flatMap((row) => {
    const evaluation = getStageEvaluation(row, stage)
    return evaluation ? [{ row, evaluation }] : []
  })
}

export function applyApplicantFilters(
  rows: ApplicantRow[],
  filters: ApplicantListFilters,
  stage: EvaluationStage,
) {
  const search = filters.search.trim()
  const chapters =
    filters.chapterTab === "all" ? filters.chapters : [filters.chapterTab]

  const scoped = scopeRowsToStage(rows, stage)

  const normalizedSearch = search.toLowerCase()

  return scoped
    .filter(({ row, evaluation }) => {
      if (
        normalizedSearch &&
        !row.applicantName.toLowerCase().includes(normalizedSearch)
      ) {
        return false
      }
      if (chapters.length > 0 && !chapters.includes(row.chapter)) return false
      if (filters.schoolTab !== "all" && row.school !== filters.schoolTab) {
        return false
      }
      if (filters.schools.length > 0 && !filters.schools.includes(row.school)) {
        return false
      }
      if (
        filters.parts.length > 0 &&
        !row.parts.some((part) => filters.parts.includes(part))
      ) {
        return false
      }
      if (
        filters.progresses.length > 0 &&
        !filters.progresses.includes(evaluation.progress)
      ) {
        return false
      }
      if (!matchesResultFilter(evaluation, filters.results)) return false
      return true
    })
    .map(({ row }) => row)
}

export function applyCardFilters(
  rows: ApplicantRow[],
  cardFilters: ApplicantCardFilters,
  stage: EvaluationStage,
) {
  return scopeRowsToStage(rows, stage)
    .filter(({ row }) => {
      if (!cardFilters.includeRegular && row.recruitmentType === "regular") {
        return false
      }
      if (
        !cardFilters.includeAdditional &&
        row.recruitmentType === "additional"
      ) {
        return false
      }
      return true
    })
    .sort((a, b) => {
      const byAppliedAt =
        cardFilters.sort === "latest"
          ? b.row.appliedAt.localeCompare(a.row.appliedAt)
          : a.row.appliedAt.localeCompare(b.row.appliedAt)

      if (byAppliedAt !== 0) return byAppliedAt

      if (cardFilters.order) {
        return compareByOrder(
          a.row,
          b.row,
          a.evaluation,
          b.evaluation,
          cardFilters.order,
        )
      }

      return 0
    })
    .map(({ row }) => row)
}
