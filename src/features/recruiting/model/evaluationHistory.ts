import type { Chapter } from "@/entities/organization/model/chapters"
import type { PartTag } from "@/shared/model/domain"

import type { EvaluationResult } from "./applicantListTypes"

export const EVALUATION_RESULT_LABEL: Record<EvaluationResult, string> = {
  pass: "합격",
  fail: "불합격",
}

// 처리 이력 한 건 = 지원자 1명을 담당자 1명이 처리한 기록.
// ApplicantRow(지원자 1명 = 1행)와는 단위 자체가 다르므로 별도 타입으로 둔다.
export interface EvaluationHistoryEntry {
  id: string
  processedAt: string // ISO 문자열. 처리 일시
  applicant: {
    chapter: Chapter
    school: string
    name: string
    part: PartTag // 테이블엔 안 보이지만 "지원 파트" 필터에 필요
    result: EvaluationResult
  }
  evaluator: {
    id: string // 담당자별 그룹핑 기준 키
    chapter: Chapter
    school: string
    position: string // 직위(회장/부회장 등). TODO: 서버 연동 시 RoleType -> 라벨 매핑으로 대체
    nickname: string
    name: string
  }
}

export type EvaluationHistoryProgress = "before" | "inProgress" | "done"

export const EVALUATION_HISTORY_PROGRESS_LABEL: Record<
  EvaluationHistoryProgress,
  string
> = {
  before: "최종 평가 전",
  inProgress: "평가 진행 중",
  done: "최종 평가 완료",
}

// ChapterTabs/필터의 "전체" 값. evaluationHistory 관련 파일 전체에서 이 상수 하나만 쓴다.
export const EVALUATION_HISTORY_CHAPTER_TAB_ALL = "all"

export type EvaluationHistorySort = "latest" | "oldest"

export const EVALUATION_HISTORY_SORT_OPTIONS: {
  value: EvaluationHistorySort
  label: string
}[] = [
  { value: "latest", label: "최신순" },
  { value: "oldest", label: "오래된 순" },
]

export interface EvaluationHistoryFilters {
  search: string
  bySchool: boolean
  chapterTab: string
  chapters: string[]
  schools: string[]
  parts: string[]
  results: string[]
}

export const DEFAULT_EVALUATION_HISTORY_FILTERS: EvaluationHistoryFilters = {
  search: "",
  bySchool: false,
  chapterTab: EVALUATION_HISTORY_CHAPTER_TAB_ALL,
  chapters: [],
  schools: [],
  parts: [],
  results: [],
}

// applicantListTypes.ts의 applyApplicantFilters 구조를 따른다.
// chapterTab이 "전체"가 아니면(ChapterTabs에서 특정 지부를 골랐으면) chapters
// 드롭다운 값 대신 chapterTab 하나만 스코프로 취급한다.
export function applyEvaluationHistoryFilters(
  rows: EvaluationHistoryEntry[],
  filters: EvaluationHistoryFilters,
): EvaluationHistoryEntry[] {
  const search = filters.search.trim().toLowerCase()
  const chapters =
    filters.chapterTab === EVALUATION_HISTORY_CHAPTER_TAB_ALL
      ? filters.chapters
      : [filters.chapterTab]

  return rows.filter((row) => {
    if (search) {
      const matchesApplicant = row.applicant.name.toLowerCase().includes(search)
      const matchesEvaluator =
        row.evaluator.name.toLowerCase().includes(search) ||
        row.evaluator.nickname.toLowerCase().includes(search)
      if (!matchesApplicant && !matchesEvaluator) return false
    }

    if (chapters.length > 0 && !chapters.includes(row.applicant.chapter)) {
      return false
    }
    if (
      filters.schools.length > 0 &&
      !filters.schools.includes(row.applicant.school)
    ) {
      return false
    }
    if (
      filters.parts.length > 0 &&
      !filters.parts.includes(row.applicant.part)
    ) {
      return false
    }
    if (
      filters.results.length > 0 &&
      !filters.results.includes(row.applicant.result)
    ) {
      return false
    }

    return true
  })
}

export function sortEvaluationHistory(
  rows: EvaluationHistoryEntry[],
  sort: EvaluationHistorySort,
): EvaluationHistoryEntry[] {
  const sorted = [...rows].sort((a, b) =>
    a.processedAt < b.processedAt ? -1 : a.processedAt > b.processedAt ? 1 : 0,
  )
  return sort === "latest" ? sorted.reverse() : sorted
}

export interface EvaluationHistoryGroup {
  evaluatorId: string
  evaluatorLabel: string
  rows: EvaluationHistoryEntry[]
}

// "담당자별" 체크 시 그룹핑.
// 1) evaluator.id 기준으로 그룹을 나눈다
// 2) 그룹 순서는 "그 담당자가 최초로 처리한 시각(가장 이른 processedAt)"이 빠른 순
// 3) 그룹 내부 row 순서는 sort 파라미터(최신순/오래된순)를 따른다
export function groupEvaluationHistoryByEvaluator(
  rows: EvaluationHistoryEntry[],
  sort: EvaluationHistorySort,
): EvaluationHistoryGroup[] {
  const rowsByEvaluator = new Map<string, EvaluationHistoryEntry[]>()
  for (const row of rows) {
    const group = rowsByEvaluator.get(row.evaluator.id)
    if (group) {
      group.push(row)
    } else {
      rowsByEvaluator.set(row.evaluator.id, [row])
    }
  }

  const groups = Array.from(rowsByEvaluator.entries()).map(
    ([evaluatorId, groupRows]) => {
      const earliestProcessedAt = groupRows.reduce(
        (earliest, row) =>
          row.processedAt < earliest ? row.processedAt : earliest,
        groupRows[0]!.processedAt,
      )
      const { nickname, name } = groupRows[0]!.evaluator
      return {
        evaluatorId,
        evaluatorLabel: `${nickname}/${name}`,
        earliestProcessedAt,
        rows: sortEvaluationHistory(groupRows, sort),
      }
    },
  )

  groups.sort((a, b) =>
    a.earliestProcessedAt < b.earliestProcessedAt
      ? -1
      : a.earliestProcessedAt > b.earliestProcessedAt
        ? 1
        : 0,
  )

  return groups.map(({ evaluatorId, evaluatorLabel, rows: groupRows }) => ({
    evaluatorId,
    evaluatorLabel,
    rows: groupRows,
  }))
}

export interface EvaluationHistorySchoolGroup {
  school: string
  rows: EvaluationHistoryEntry[]
}

// "학교별" 체크 시 학교 단위로 뭉쳐서 정렬하기 위한 그룹핑(지원자 학교 기준).
// groupEvaluationHistoryByEvaluator와 마찬가지로 호출하는 쪽에서 flatMap해서
// 행 순서만 바꾸는 용도로 쓴다. 별도 섹션/카드로 나누지 않는다.
export function groupEvaluationHistoryBySchool(
  rows: EvaluationHistoryEntry[],
): EvaluationHistorySchoolGroup[] {
  const rowsBySchool = new Map<string, EvaluationHistoryEntry[]>()
  for (const row of rows) {
    const group = rowsBySchool.get(row.applicant.school)
    if (group) {
      group.push(row)
    } else {
      rowsBySchool.set(row.applicant.school, [row])
    }
  }
  return Array.from(rowsBySchool.entries()).map(([school, groupRows]) => ({
    school,
    rows: groupRows,
  }))
}

export function formatHistoryProcessedAt(processedAt: string) {
  const date = new Date(processedAt)
  const pad = (value: number) => String(value).padStart(2, "0")
  return {
    date: `${String(date.getFullYear()).slice(2)}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`,
    time: `${pad(date.getHours())}:${pad(date.getMinutes())}`,
  }
}

const EVALUATION_HISTORY_CSV_HEADER = [
  "처리일시",
  "지원자 지부",
  "지원자 학교",
  "지원자 이름",
  "지원자 결과",
  "담당자 지부",
  "담당자 학교",
  "담당자 직위",
  "담당자 닉네임",
  "담당자 이름",
]

function escapeCsvCell(value: string) {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

// CSV 문자열만 만드는 순수 함수. 실제로 파일로 내려받는 건 호출하는 쪽(archive.tsx)의 책임.
export function toEvaluationHistoryCsv(rows: EvaluationHistoryEntry[]): string {
  const lines = [EVALUATION_HISTORY_CSV_HEADER.join(",")]

  for (const row of rows) {
    const { date, time } = formatHistoryProcessedAt(row.processedAt)
    const cells = [
      `${date} ${time}`,
      row.applicant.chapter,
      row.applicant.school,
      row.applicant.name,
      EVALUATION_RESULT_LABEL[row.applicant.result],
      row.evaluator.chapter,
      row.evaluator.school,
      row.evaluator.position,
      row.evaluator.nickname,
      row.evaluator.name,
    ]
    lines.push(cells.map(escapeCsvCell).join(","))
  }

  return lines.join("\n")
}
