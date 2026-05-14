import { api } from "@/shared/lib/axios"

import type { ApiResponse } from "@/shared/lib/apiResponse"

import type {
  DecisionRequest,
  DecisionResponse,
  ManagedProjectSummaryResponse,
  MatchingRoundResponse,
  PageResponse,
  ProjectApplicantResponse,
  ProjectApplicationDetailResponse,
} from "../model/apiTypes"

// 프로젝트별 지원자 목록 조회
export async function getProjectApplications(
  projectId: number,
  params?: {
    matchingRoundId?: number
    part?: string
    status?: string
  },
) {
  const { data } = await api.get<ApiResponse<ProjectApplicantResponse[]>>(
    `/v1/projects/${projectId}/applications`,
    { params },
  )
  return data.result
}

// 지원서 단건 상세 조회
export async function getApplicationDetail(
  projectId: number,
  applicationId: number,
) {
  const { data } = await api.get<ApiResponse<ProjectApplicationDetailResponse>>(
    `/v1/projects/${projectId}/applications/${applicationId}`,
  )
  return data.result
}

// 전체 프로젝트 목록 조회 (admin용)
export async function getAllProjects(
  gisuId: number,
  params?: {
    chapterId?: number
    keyword?: string
    partQuotaStatus?: string
    page?: number
    size?: number
  },
) {
  const { data } = await api.get<
    ApiResponse<PageResponse<ManagedProjectSummaryResponse>>
  >("/v1/projects", {
    params: { gisuId, ...params },
  })
  return data.result
}

// 내가 관리하는 프로젝트 목록 (PM용)
export async function getManagedProjects(
  gisuId: number,
  params?: {
    keyword?: string
    page?: number
    size?: number
  },
) {
  const { data } = await api.get<
    ApiResponse<PageResponse<ManagedProjectSummaryResponse>>
  >("/v1/projects/me/managed", {
    params: { gisuId, ...params },
  })
  return data.result
}

// 매칭 차수 목록 조회
export async function getMatchingRounds(chapterId?: number) {
  const { data } = await api.get<ApiResponse<MatchingRoundResponse[]>>(
    "/v1/project/matching-rounds",
    { params: chapterId ? { chapterId } : undefined },
  )
  return data.result
}

// 지원서 합불 결정
export async function updateApplicationDecision(
  projectId: number,
  applicationId: number,
  body: DecisionRequest,
) {
  const { data } = await api.patch<ApiResponse<DecisionResponse>>(
    `/v1/projects/${projectId}/applications/${applicationId}/decision`,
    body,
  )
  return data.result
}
