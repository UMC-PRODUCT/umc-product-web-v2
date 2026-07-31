import { api } from "@/shared/lib/axios"

import type { ApiResponse } from "@/shared/lib/apiResponse"

import type {
  ApiEvaluationStage,
  FinalDecisionBody,
  FormStructureQuery,
  PublicRoundsQuery,
  RawCount,
  RawEvaluationStatistics,
  RawPartSummary,
  RawStatusCounts,
  RawStatusSummary,
  RawTrackCount,
  RecruitingApplicationDetail,
  RecruitingApplicationPage,
  RecruitingApplicationSummary,
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

// 서버가 문자열로 주는 건수를 숫자로, ID 를 문자열로 고정하고 빠질 수 있는
// 배열/객체를 채운다. 순수 함수라 테스트에서 응답 형태를 그대로 넣어볼 수 있다.
function toCount(value: RawCount | undefined): number {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
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
