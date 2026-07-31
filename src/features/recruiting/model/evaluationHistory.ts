import { shortenSchoolName } from "@/shared/lib/formatSchoolName"

import type { PartTag } from "@/shared/model/domain"

import type { RecruitingDecisionResult, RecruitingTrack } from "../api/types"
import type { EvaluationResult } from "./applicantListTypes"

// 화면 필터 값 -> 서버 파라미터. TRACK_PART_TAG(트랙 -> 파트)의 역방향이다.
const PART_TAG_TRACK: Partial<Record<string, RecruitingTrack>> = {
  pm: "PLAN",
  design: "DESIGN",
  "web-pe": "WEB_PRODUCT_ENGINEER",
  "mobile-pe": "MOBILE_PRODUCT_ENGINEER",
}

const RESULT_TO_SERVER: Partial<Record<string, RecruitingDecisionResult>> = {
  pass: "PASSED",
  fail: "FAILED",
}

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
    // 서버 필터는 이름이 아니라 숫자 ID 를 받는다. CSV 다운로드에 필터를 그대로
    // 넘기려면 행에 ID 를 들고 있어야 한다.
    chapterId: string
    schoolId: string
    // 서버가 주는 지부명을 그대로 쓴다. 프론트 CHAPTERS 상수(6개)는 역대 지부
    // 전체를 담지 않아 union 으로 좁히면 데이터가 사라진다.
    chapter: string
    school: string
    name: string
    part: PartTag // 테이블엔 안 보이지만 "지원 파트" 필터에 필요
    result: EvaluationResult
  }
  evaluator: {
    id: string // 담당자별 그룹핑 기준 키
    // 중앙 직위 담당자는 지부·학교가 없어 빈 문자열로 온다.
    chapter: string
    school: string
    position: string // 직위 라벨. 판정 시점 roleType 스냅샷을 매핑한 값
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
  // 평가 결과는 단일 선택이다(기획 확정). 미선택은 빈 문자열.
  result: string
}

export const DEFAULT_EVALUATION_HISTORY_FILTERS: EvaluationHistoryFilters = {
  search: "",
  bySchool: false,
  chapterTab: EVALUATION_HISTORY_CHAPTER_TAB_ALL,
  chapters: [],
  schools: [],
  parts: [],
  result: "",
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
    if (filters.result !== "" && filters.result !== row.applicant.result) {
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

export interface EvaluationHistoryOrderOptions {
  sort: EvaluationHistorySort
  byEvaluator: boolean
  bySchool: boolean
}

// 화면(EvaluationHistoryCard)과 CSV 다운로드가 항상 같은 순서를 쓰도록 단일 함수로 통일.
// 우선순위: 담당자별 > 학교별 > 기본 정렬.
export function orderEvaluationHistoryRows(
  rows: EvaluationHistoryEntry[],
  { sort, byEvaluator, bySchool }: EvaluationHistoryOrderOptions,
): EvaluationHistoryEntry[] {
  if (byEvaluator) {
    return groupEvaluationHistoryByEvaluator(rows, sort).flatMap(
      (group) => group.rows,
    )
  }
  if (bySchool) {
    return groupEvaluationHistoryBySchool(rows).flatMap((group) =>
      sortEvaluationHistory(group.rows, sort),
    )
  }
  return sortEvaluationHistory(rows, sort)
}

export function formatHistoryProcessedAt(processedAt: string) {
  const date = new Date(processedAt)
  const pad = (value: number) => String(value).padStart(2, "0")
  return {
    date: `${String(date.getFullYear()).slice(2)}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`,
    time: `${pad(date.getHours())}:${pad(date.getMinutes())}`,
  }
}

// 서버 판정 이력 조회 파라미터로 옮긴다. CSV 다운로드가 화면과 같은 범위를 쓰도록
// 목록 조회와 같은 조건을 넘긴다.
//
// 지부·학교는 서버가 단일 숫자 ID 만 받는데 필터 바는 다중 선택이다(기획 확정).
// 그래서 하나만 고른 경우에만 전달하고, 둘 이상이면 전달하지 않아 CSV 에 전 범위가
// 담긴다. 서버가 chapterIds/schoolIds 배열을 받아주면 그때 전부 전달할 수 있다.
// 이름 -> ID 는 행에 실려 온 값을 쓴다(조회를 더 하지 않는다).
function toSingleId(
  rows: EvaluationHistoryEntry[],
  selectedNames: string[],
  pick: (row: EvaluationHistoryEntry) => { id: string; name: string },
): string | undefined {
  if (selectedNames.length !== 1) return undefined
  const target = selectedNames[0]
  const matched = rows.find((row) => pick(row).name === target)
  return matched ? pick(matched).id : undefined
}

export function toDecisionHistoriesQuery(
  filters: EvaluationHistoryFilters,
  sort: EvaluationHistorySort,
  byEvaluator: boolean,
  rows: EvaluationHistoryEntry[],
) {
  const search = filters.search.trim()
  const tracks = filters.parts
    .map((part) => PART_TAG_TRACK[part])
    .filter((track): track is RecruitingTrack => track != null)
  const result = RESULT_TO_SERVER[filters.result]

  // 지부 탭으로 좁혀졌으면 그 지부가 곧 선택이다.
  const chapterNames =
    filters.chapterTab === EVALUATION_HISTORY_CHAPTER_TAB_ALL
      ? filters.chapters
      : [filters.chapterTab]

  return {
    chapterId: toSingleId(rows, chapterNames, (row) => ({
      id: row.applicant.chapterId,
      name: row.applicant.chapter,
    })),
    schoolId: toSingleId(rows, filters.schools, (row) => ({
      id: row.applicant.schoolId,
      name: row.applicant.school,
    })),
    tracks: tracks.length > 0 ? tracks : undefined,
    results: result ? [result] : undefined,
    searchName: search === "" ? undefined : search,
    sort: sort === "latest" ? ("LATEST" as const) : ("OLDEST" as const),
    groupByDecider: byEvaluator,
  }
}

export interface HistoryFilterOption {
  value: string
  label: string
}

function uniqueSorted(values: string[]): string[] {
  return [...new Set(values.filter((value) => value !== ""))].sort((a, b) =>
    a.localeCompare(b, "ko"),
  )
}

// 필터 선택지를 하드코딩 상수가 아니라 실제 응답에서 만든다. 상수로 만들면 두 가지가
// 깨진다.
// 1) 학교: 상수는 약칭("가천대")인데 서버는 정식 명칭("가천대학교")을 준다. 값이
//    달라 어떤 학교를 골라도 필터 결과가 0건이 된다.
// 2) 지부: 상수는 현재 기수 6개뿐이라 과거 기수 지부(GOAT, 오션 등) 이력은 표에는
//    보이는데 필터로 좁힐 수 없다.
export function buildHistoryChapterOptions(
  rows: EvaluationHistoryEntry[],
): HistoryFilterOption[] {
  return uniqueSorted(rows.map((row) => row.applicant.chapter)).map(
    (chapter) => ({ value: chapter, label: chapter }),
  )
}

// 값은 매칭용이라 서버 정식 명칭을 그대로 두고, 화면에 보이는 label 만 약칭으로 줄인다.
// chapterNames 가 비어 있으면 전체 학교를 대상으로 한다.
export function buildHistorySchoolOptions(
  rows: EvaluationHistoryEntry[],
  chapterNames: string[],
): HistoryFilterOption[] {
  const scoped =
    chapterNames.length > 0
      ? rows.filter((row) => chapterNames.includes(row.applicant.chapter))
      : rows

  return uniqueSorted(scoped.map((row) => row.applicant.school)).map(
    (school) => ({ value: school, label: shortenSchoolName(school) }),
  )
}
