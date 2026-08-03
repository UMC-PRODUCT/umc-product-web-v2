import { api } from "@/shared/lib/axios"

import type { ApiResponse } from "@/shared/lib/apiResponse"

import type {
  AdminRoundsQuery,
  ApiEvaluationStage,
  CloneRecruitingRoundRequest,
  CreateApplicationDraftBody,
  CreateRecruitingRoundRequest,
  DecisionHistoriesQuery,
  FinalDecisionBody,
  FormStructureQuery,
  PublicRoundsQuery,
  RawAdminRoundGroup,
  RawCount,
  RawDecisionHistoryPage,
  RawEvaluationStatistics,
  RawId,
  RawPartSummary,
  RawStatusCounts,
  RawStatusSummary,
  RawTrackCount,
  RecruitingApplicationCreated,
  RecruitingApplicationDetail,
  RecruitingApplicationMutationResult,
  RecruitingApplicationPage,
  RecruitingApplicationSummary,
  RecruitingDecisionHistoryPage,
  RecruitingEvaluation,
  RecruitingEvaluationStatistics,
  RecruitingFormStructure,
  RecruitingInterviewQuestion,
  RecruitingRoundEvaluator,
  RecruitingRoundGroup,
  RecruitingRoundPhase,
  RecruitingStatusCounts,
  RecruitingStatusSummary,
  RoundApplicationsQuery,
  StatusSummaryQuery,
  SubmitEvaluationBody,
  UpdateApplicationDraftBody,
  UpdateRecruitingRoundRequest,
  UpdateRecruitingRoundStatusRequest,
  UpsertRecruitingApplicationFormRequest,
} from "./types"

const APPLICATIONS_PAGE_SIZE = 100

// 관리자용 차수 목록은 학교 회장단 이상만 조회할 수 있어 평가자 권한만 가진
// 운영진이 403 을 받는다. 공개 목록이 같은 차수 응답을 주므로 이쪽을 쓴다.
export async function getPublicRounds(
  params: PublicRoundsQuery,
): Promise<RecruitingRoundGroup[]> {
  const { data } = await api.get<ApiResponse<RecruitingRoundGroup[]>>(
    "/v1/recruiting/public/rounds",
    { params, paramsSerializer: { indexes: null } },
  )
  return data.result
}

export function mergeRoundGroups(
  groups: RecruitingRoundGroup[],
): RecruitingRoundGroup[] {
  const bySeason = new Map<string, RecruitingRoundGroup>()

  groups.forEach((group) => {
    const key = String(group.seasonId)
    const merged = bySeason.get(key)
    if (!merged) {
      bySeason.set(key, { ...group, rounds: [...group.rounds] })
      return
    }
    const seen = new Set(merged.rounds.map((round) => String(round.roundId)))
    merged.rounds.push(
      ...group.rounds.filter((round) => !seen.has(String(round.roundId))),
    )
  })

  return [...bySeason.values()]
}

// phase 는 서버에서 OPEN 이 기본값이라 마감된 차수가 빠진다. 값이 두 개뿐이라
// 한쪽으로는 전 구간을 덮을 수 없어 둘 다 조회해 합친다.
export async function getAllPublicRounds(
  gisuId: string,
  roundIds?: string[],
): Promise<RecruitingRoundGroup[]> {
  const phases: RecruitingRoundPhase[] = ["PAST", "OPEN"]
  const perPhase = await Promise.all(
    phases.map((phase) => getPublicRounds({ gisuId, roundIds, phase })),
  )
  return mergeRoundGroups(perPhase.flat())
}

// 시즌은 기수·학교당 1회만 생성되고 전용 생성/목록 화면이 없다. 모집 생성 화면이
// seasonId를 알아내려면 이 관리자용 목록에서 뽑아 써야 한다 — 공개 목록
// (getPublicRounds)은 OPEN/CLOSED 차수만 내려줘서 차수를 하나도 안 만든 시즌은
// 빠지기 때문에 대체할 수 없다.
export async function getAdminRounds(
  params: AdminRoundsQuery,
): Promise<RecruitingRoundGroup[]> {
  const { data } = await api.get<ApiResponse<RawAdminRoundGroup[]>>(
    "/v1/recruiting/admin/rounds",
    { params, paramsSerializer: { indexes: null } },
  )
  return normalizeAdminRoundGroups(data.result)
}

// 관리자 응답은 차수 식별자를 id 로 내려주는데 화면은 공개 응답과 같은 roundId 를 읽는다.
// 옮겨 놓지 않으면 목록 카드의 postId 와 수정 화면의 차수 조회가 모두 undefined 가 된다.
export function normalizeAdminRoundGroups(
  groups: RawAdminRoundGroup[],
): RecruitingRoundGroup[] {
  return (groups ?? []).map((group) => ({
    ...group,
    rounds: (group.rounds ?? []).map(({ id, ...round }) => ({
      ...round,
      roundId: String(round.roundId ?? id ?? ""),
    })),
  }))
}

export async function getRoundApplications(
  roundId: string,
  params: RoundApplicationsQuery = {},
): Promise<RecruitingApplicationPage> {
  const { data } = await api.get<ApiResponse<RecruitingApplicationPage>>(
    `/v1/recruiting/rounds/${roundId}/applications`,
    { params, paramsSerializer: { indexes: null } },
  )
  return data.result
}

export async function getAllRoundApplications(
  roundId: string,
  params: Omit<RoundApplicationsQuery, "page" | "size"> = {},
): Promise<RecruitingApplicationSummary[]> {
  const collected: RecruitingApplicationSummary[] = []
  let page = 0

  for (;;) {
    const result = await getRoundApplications(roundId, {
      ...params,
      page,
      size: APPLICATIONS_PAGE_SIZE,
    })
    collected.push(...result.content)
    if (!result.hasNext) return collected
    page += 1
  }
}

const DECISION_HISTORY_PAGE_SIZE = 100

// 서버가 문자열로 주는 건수를 숫자로, ID 를 문자열로 고정하고 빠질 수 있는
// 배열/객체를 채운다. 순수 함수라 테스트에서 응답 형태를 그대로 넣어볼 수 있다.
function toCount(value: RawCount | undefined): number {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

function toOptionalId(value: RawId | null | undefined): string | null {
  return value == null ? null : String(value)
}

// 서버가 ID 와 건수를 문자열로 주므로 경계에서 정리한다. 중앙 직위 담당자는
// 지부·학교가 null 이라 그대로 null 로 남긴다.
export function normalizeDecisionHistoryPage(
  raw: RawDecisionHistoryPage,
): RecruitingDecisionHistoryPage {
  const histories = raw.histories ?? {}
  return {
    asOf: raw.asOf ?? null,
    progressStatus: raw.progressStatus,
    content: (histories.content ?? []).map((item) => ({
      ...item,
      decisionHistoryId: String(item.decisionHistoryId),
      applicationId: String(item.applicationId),
      applicant: {
        ...item.applicant,
        chapterId: String(item.applicant.chapterId),
        schoolId: String(item.applicant.schoolId),
      },
      decider: {
        ...item.decider,
        memberId: String(item.decider.memberId),
        chapterId: toOptionalId(item.decider.chapterId),
        schoolId: toOptionalId(item.decider.schoolId),
      },
    })),
    page: toCount(histories.page),
    size: toCount(histories.size),
    totalElements: toCount(histories.totalElements),
    totalPages: toCount(histories.totalPages),
    hasNext: histories.hasNext ?? false,
    hasPrevious: histories.hasPrevious ?? false,
  }
}

// 평가 이력 조회 (RECRUITING-ADMIN-091). 중앙 3역할만 조회할 수 있고 학교·지부
// 운영진은 감사 대상이라 403 을 받는다.
export async function getDecisionHistories(
  params: DecisionHistoriesQuery,
): Promise<RecruitingDecisionHistoryPage> {
  const { data } = await api.get<ApiResponse<RawDecisionHistoryPage>>(
    "/v1/recruiting/admin/decision-histories",
    { params, paramsSerializer: { indexes: null } },
  )
  return normalizeDecisionHistoryPage(data.result)
}

// 화면이 지부·학교 다중 선택과 학교별 그룹핑을 클라이언트에서 처리하고 있어 전량을
// 받아야 한다. 서버 필터(chapterId/schoolId)는 단일 ID 라 이름 기반인 현재 필터와
// 바로 맞물리지 않는다. asOf 와 progressStatus 는 첫 페이지 값을 쓴다.
export async function getAllDecisionHistories(
  params: Omit<DecisionHistoriesQuery, "page" | "size">,
): Promise<RecruitingDecisionHistoryPage> {
  const first = await getDecisionHistories({
    ...params,
    page: 0,
    size: DECISION_HISTORY_PAGE_SIZE,
  })
  if (!first.hasNext) return first

  // totalPages 로 반복을 끊으면 그 값이 빠졌을 때(toCount 가 0 을 돌려줌) 2페이지부터
  // 통째로 누락된다. 감사용 이력이라 조용한 유실이 특히 위험해 각 응답의 hasNext 를
  // 따라간다.
  const content = [...first.content]
  let page = 1
  let hasNext: boolean = first.hasNext
  while (hasNext) {
    const next = await getDecisionHistories({
      ...params,
      page,
      size: DECISION_HISTORY_PAGE_SIZE,
    })
    content.push(...next.content)
    hasNext = next.hasNext
    page += 1
  }
  return { ...first, content }
}

// 평가 이력 CSV 다운로드 (RECRUITING-ADMIN-092). 목록 조회와 같은 조건을 받으며
// 원문 이메일과 실명을 제외하고 ID·마스킹 이메일로 준다. 서버가 text/csv 를 그대로
// 주므로 Blob 으로 받는다(스펙에는 format: byte 로 적혀 있으나 base64 가 아니다).
export async function downloadDecisionHistoriesCsv(
  params: Omit<DecisionHistoriesQuery, "page" | "size">,
): Promise<Blob> {
  const { data } = await api.get<Blob>(
    "/v1/recruiting/admin/decision-histories.csv",
    { params, paramsSerializer: { indexes: null }, responseType: "blob" },
  )
  return data
}

function toStatusCounts(raw: RawStatusCounts | undefined) {
  const counts: Record<string, number> = {}
  for (const [status, value] of Object.entries(raw ?? {})) {
    counts[status] = toCount(value)
  }
  return counts as RecruitingStatusCounts
}

function toPartSummaries(raw: RawPartSummary[] | undefined) {
  return (raw ?? []).map((part) => ({
    ...part,
    totalCount: toCount(part.totalCount),
    countByStatus: toStatusCounts(part.countByStatus),
  }))
}

export function normalizeStatusSummary(
  raw: RawStatusSummary,
): RecruitingStatusSummary {
  return {
    totalCount: toCount(raw.totalCount),
    countByStatus: toStatusCounts(raw.countByStatus),
    parts: toPartSummaries(raw.parts),
    schools: (raw.schools ?? []).map((school) => ({
      ...school,
      schoolId: String(school.schoolId),
      chapterId: String(school.chapterId),
      totalCount: toCount(school.totalCount),
      countByStatus: toStatusCounts(school.countByStatus),
      parts: toPartSummaries(school.parts),
      rounds: (school.rounds ?? []).map((round) => ({
        ...round,
        roundId: String(round.roundId),
        totalCount: toCount(round.totalCount),
        countByStatus: toStatusCounts(round.countByStatus),
        parts: toPartSummaries(round.parts),
      })),
    })),
  }
}

function toTrackCounts(raw: RawTrackCount[] | undefined) {
  return (raw ?? []).map((item) => ({
    ...item,
    applicantCount: toCount(item.applicantCount),
    evaluatedCount: toCount(item.evaluatedCount),
  }))
}

// 정렬은 서버가 이미 해준다(지부 가나다 > 학교 가나다). 여기서는 문자열 건수를
// 숫자로 바꾸고 빠질 수 있는 배열만 채운다.
export function normalizeEvaluationStatistics(
  raw: RawEvaluationStatistics,
): RecruitingEvaluationStatistics {
  return {
    asOf: raw.asOf ?? null,
    applicantCount: toCount(raw.applicantCount),
    evaluatedCount: toCount(raw.evaluatedCount),
    byTrack: toTrackCounts(raw.byTrack),
    chapters: (raw.chapters ?? []).map((chapter) => ({
      ...chapter,
      chapterId: String(chapter.chapterId),
      applicantCount: toCount(chapter.applicantCount),
      evaluatedCount: toCount(chapter.evaluatedCount),
      byTrack: toTrackCounts(chapter.byTrack),
      schools: (chapter.schools ?? []).map((school) => ({
        ...school,
        schoolId: String(school.schoolId),
        applicantCount: toCount(school.applicantCount),
        evaluatedCount: toCount(school.evaluatedCount),
        byTrack: toTrackCounts(school.byTrack),
      })),
    })),
  }
}

// 평가 현황 대시보드용 집계 (RECRUITING-ADMIN-083). 화면의 4개 위젯이 모두 이
// 응답 하나에서 나온다. 위젯별로 나눠 호출하면 시점 차이로 카드 합계와 차트
// 합계가 어긋나기 때문에 서버가 단일 스냅샷으로 설계했다.
export async function getEvaluationStatistics(
  gisuId: string,
): Promise<RecruitingEvaluationStatistics> {
  const { data } = await api.get<ApiResponse<RawEvaluationStatistics>>(
    "/v1/recruiting/admin/statistics/evaluations",
    { params: { gisuId } },
  )
  return normalizeEvaluationStatistics(data.result)
}

// 지원 현황 대시보드용 집계. admin 경로라 getPublicRounds 와 달리 학교 회장단
// 이상만 조회할 수 있을 가능성이 있어 403 처리가 필요할 수 있다.
// 파트(track)별 집계는 응답에 없다.
export async function getStatusSummary(
  params: StatusSummaryQuery,
): Promise<RecruitingStatusSummary> {
  const { data } = await api.get<ApiResponse<RawStatusSummary>>(
    "/v1/recruiting/admin/summary",
    { params, paramsSerializer: { indexes: null } },
  )
  return normalizeStatusSummary(data.result)
}

export async function getApplicationDetail(
  roundId: string,
  applicationId: string,
): Promise<RecruitingApplicationDetail> {
  const { data } = await api.get<ApiResponse<RecruitingApplicationDetail>>(
    `/v1/recruiting/rounds/${roundId}/applications/${applicationId}`,
  )
  return data.result
}

export async function getFormStructure(
  applicationFormId: string,
  params: FormStructureQuery,
): Promise<RecruitingFormStructure> {
  const { data } = await api.get<ApiResponse<RecruitingFormStructure>>(
    `/v1/recruiting/public/forms/${applicationFormId}/structure`,
    { params },
  )
  return data.result
}

export async function createApplicationDraft(
  body: CreateApplicationDraftBody,
): Promise<RecruitingApplicationCreated> {
  const { data } = await api.post<ApiResponse<RecruitingApplicationCreated>>(
    "/v1/recruiting/applications",
    body,
  )
  return data.result
}

export async function saveApplicationDraft(
  applicationId: string,
  body: UpdateApplicationDraftBody,
): Promise<RecruitingApplicationMutationResult> {
  const { data } = await api.put<
    ApiResponse<RecruitingApplicationMutationResult>
  >(`/v1/recruiting/applications/${applicationId}`, body)
  return data.result
}

// submittedIp 를 생략하면 서버가 요청의 원격 주소를 쓴다.
export async function submitApplication(
  applicationId: string,
): Promise<RecruitingApplicationMutationResult> {
  const { data } = await api.post<
    ApiResponse<RecruitingApplicationMutationResult>
  >(`/v1/recruiting/applications/${applicationId}/submit`, {})
  return data.result
}

export async function cancelApplication(applicationId: string): Promise<void> {
  await api.patch(`/v1/recruiting/applications/${applicationId}/cancel`)
}

export async function getStageEvaluations(
  roundId: string,
  applicationId: string,
  stage: ApiEvaluationStage,
): Promise<RecruitingEvaluation[]> {
  const { data } = await api.get<ApiResponse<RecruitingEvaluation[]>>(
    `/v1/recruiting/rounds/${roundId}/applications/${applicationId}/evaluations/${stage}`,
  )
  return data.result
}

export async function checkRecruitingRoundTitleAvailability(
  seasonId: string,
  title: string,
  excludedRoundId?: string,
): Promise<boolean> {
  const { data } = await api.get<ApiResponse<{ available?: boolean }>>(
    `/v1/recruiting/admin/seasons/${seasonId}/rounds/title-availability`,
    { params: { title, excludedRoundId } },
  )
  return data.result.available ?? false
}

export async function createRecruitingRound(
  seasonId: string,
  payload: CreateRecruitingRoundRequest,
): Promise<string> {
  const { data } = await api.post<ApiResponse<{ id: number }>>(
    `/v1/recruiting/admin/seasons/${seasonId}/rounds`,
    payload,
  )
  return String(data.result.id)
}

// 모집 기간, 트랙, 2지망 정책, 면접 설정을 변경한다.
// title/recruitableTracks/기간은 required라 매번 현재 값 전체를 다시 실어 보내야 한다(부분 patch 아님).
export async function updateRecruitingRound(
  seasonId: string,
  roundId: string,
  payload: UpdateRecruitingRoundRequest,
): Promise<void> {
  await api.put(
    `/v1/recruiting/admin/seasons/${seasonId}/rounds/${roundId}`,
    payload,
  )
}

// Round가 DRAFT일 때만 지원 Form 구조를 통째로 Upsert할 수 있다. Round 생성
// (createRecruitingRound) 직후, roundId를 받은 뒤에만 호출 가능하다.
export async function upsertRecruitingApplicationForm(
  seasonId: string,
  roundId: string,
  payload: UpsertRecruitingApplicationFormRequest,
): Promise<string> {
  const { data } = await api.put<ApiResponse<{ id: number }>>(
    `/v1/recruiting/admin/seasons/${seasonId}/rounds/${roundId}/form`,
    payload,
  )
  return String(data.result.id)
}

// Round와 지원 Form 상태를 함께 변경한다. 지원서·Form 응답이 없는 OPEN Round만
// DRAFT로 되돌릴 수 있고, CLOSED는 다시 열거나 DRAFT로 되돌릴 수 없다(백엔드 검증).
export async function updateRecruitingRoundStatus(
  seasonId: string,
  roundId: string,
  payload: UpdateRecruitingRoundStatusRequest,
): Promise<void> {
  await api.patch(
    `/v1/recruiting/admin/seasons/${seasonId}/rounds/${roundId}/status`,
    payload,
  )
}

// Round 설정, 지원 Form 전체 구조, 활성 공통 질문을 targetSeasonId의 새 DRAFT
// Round로 복제한다.
export async function cloneRecruitingRound(
  seasonId: string,
  roundId: string,
  payload: CloneRecruitingRoundRequest,
): Promise<string> {
  const { data } = await api.post<ApiResponse<{ id: number }>>(
    `/v1/recruiting/admin/seasons/${seasonId}/rounds/${roundId}/clone`,
    payload,
  )
  return String(data.result.id)
}

// 지원서와 Form 응답이 없는 DRAFT Round만 삭제 가능(백엔드 검증). 복구 불가.
export async function deleteRecruitingRound(
  seasonId: string,
  roundId: string,
): Promise<void> {
  await api.delete(`/v1/recruiting/admin/seasons/${seasonId}/rounds/${roundId}`)
}

export async function getRoundEvaluators(
  roundId: string,
): Promise<RecruitingRoundEvaluator[]> {
  const { data } = await api.get<ApiResponse<RecruitingRoundEvaluator[]>>(
    `/v1/recruiting/admin/rounds/${roundId}/evaluators`,
  )
  return data.result
}

export async function submitEvaluation(
  roundId: string,
  applicationId: string,
  stage: ApiEvaluationStage,
  body: SubmitEvaluationBody,
): Promise<void> {
  await api.put(
    `/v1/recruiting/rounds/${roundId}/applications/${applicationId}/evaluations/${stage}`,
    body,
  )
}

export async function decideFinal(
  applicationId: string,
  body: FinalDecisionBody,
): Promise<void> {
  await api.patch(
    `/v1/recruiting/admin/applications/${applicationId}/final-decision`,
    body,
  )
}

export async function getRoundInterviewQuestions(
  roundId: string,
): Promise<RecruitingInterviewQuestion[]> {
  const { data } = await api.get<ApiResponse<RecruitingInterviewQuestion[]>>(
    `/v1/recruiting/admin/rounds/${roundId}/questions`,
  )
  return data.result
}

export async function getApplicationInterviewQuestions(
  applicationId: string,
): Promise<RecruitingInterviewQuestion[]> {
  const { data } = await api.get<ApiResponse<RecruitingInterviewQuestion[]>>(
    `/v1/recruiting/admin/applications/${applicationId}/questions`,
  )
  return data.result
}
