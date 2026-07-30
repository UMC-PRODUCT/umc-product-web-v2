import { api } from "@/shared/lib/axios"

import type { ApiResponse } from "@/shared/lib/apiResponse"

import type {
  AdminRoundsQuery,
  ApiEvaluationStage,
  CloneRecruitingRoundRequest,
  CreateRecruitingRoundRequest,
  FinalDecisionBody,
  FormStructureQuery,
  PublicRoundsQuery,
  RecruitingApplicationDetail,
  RecruitingApplicationPage,
  RecruitingApplicationSummary,
  RecruitingEvaluation,
  RecruitingFormStructure,
  RecruitingInterviewQuestion,
  RecruitingRoundEvaluator,
  RecruitingRoundGroup,
  RecruitingRoundPhase,
  RoundApplicationsQuery,
  SubmitEvaluationBody,
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
  const { data } = await api.get<ApiResponse<RecruitingRoundGroup[]>>(
    "/v1/recruiting/admin/rounds",
    { params, paramsSerializer: { indexes: null } },
  )
  return data.result
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
