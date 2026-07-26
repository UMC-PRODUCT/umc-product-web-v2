import { api } from "@/shared/lib/axios"

import type { ApiResponse } from "@/shared/lib/apiResponse"

import type {
  ApiEvaluationStage,
  FormStructureQuery,
  PublicRoundsQuery,
  RecruitingApplicationDetail,
  RecruitingApplicationPage,
  RecruitingApplicationSummary,
  RecruitingEvaluation,
  RecruitingFormStructure,
  RecruitingPublicRoundGroup,
  RecruitingRoundEvaluator,
  RecruitingRoundGroup,
  RecruitingRoundPhase,
  RecruitingRoundsQuery,
  RoundApplicationsQuery,
} from "./types"

const APPLICATIONS_PAGE_SIZE = 100

export async function getRecruitingRounds(
  params: RecruitingRoundsQuery,
): Promise<RecruitingRoundGroup[]> {
  const { data } = await api.get<ApiResponse<RecruitingRoundGroup[]>>(
    "/v1/recruiting/admin/rounds",
    { params },
  )
  return data.result
}

// 관리자용 차수 목록(ADMIN-011)은 학교 회장단 이상만 조회할 수 있다. 평가자로만
// 등록된 운영진도 차수 정보가 필요하므로 공개 목록을 쓴다.
export async function getPublicRounds(
  params: PublicRoundsQuery,
): Promise<RecruitingPublicRoundGroup[]> {
  const { data } = await api.get<ApiResponse<RecruitingPublicRoundGroup[]>>(
    "/v1/recruiting/public/rounds",
    { params, paramsSerializer: { indexes: null } },
  )
  return data.result
}

// phase 는 서버에서 OPEN 이 기본값이라 마감된 차수가 빠진다. 평가는 서류 마감 후에
// 하므로 두 구간을 모두 조회해 합친다.
export async function findPublicRound(
  gisuId: string,
  roundId: string,
): Promise<RecruitingPublicRoundGroup[]> {
  const phases: RecruitingRoundPhase[] = ["PAST", "OPEN"]
  const perPhase = await Promise.all(
    phases.map((phase) =>
      getPublicRounds({ gisuId, roundIds: [roundId], phase }),
    ),
  )
  return perPhase.flat()
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

export async function getRoundEvaluators(
  roundId: string,
): Promise<RecruitingRoundEvaluator[]> {
  const { data } = await api.get<ApiResponse<RecruitingRoundEvaluator[]>>(
    `/v1/recruiting/admin/rounds/${roundId}/evaluators`,
  )
  return data.result
}
