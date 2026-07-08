import { api } from "@/shared/lib/axios"

import type { ApiResponse } from "@/shared/lib/apiResponse"

import type {
  ChapterMatchingStatisticsResponse,
  ChapterStatisticsResponse,
  CreateMatchingRoundRequest,
  DecisionRequest,
  DecisionResponse,
  ManagedProjectSummaryResponse,
  MatchingRoundResponse,
  PageResponse,
  ProjectApplicantResponse,
  ProjectApplicationDetailResponse,
  UpdateMatchingRoundRequest,
} from "../model/apiTypes"
import type { ProjectPermissionsResult } from "../model/projectPermissionTypes"

// 프로젝트 단위 화면 분기용 capability 일괄 조회 (PROJECT-PERMISSIONS-001)
export async function getProjectsPermissions(
  ids: Array<string | number>,
): Promise<ProjectPermissionsResult> {
  if (ids.length === 0) return { projects: [] }
  const { data } = await api.get<ApiResponse<ProjectPermissionsResult>>(
    "/v1/projects/permissions",
    { params: { ids: ids.join(",") } },
  )
  return data.result
}

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
    statuses?: Array<
      "DRAFT" | "PENDING_REVIEW" | "IN_PROGRESS" | "COMPLETED" | "ABORTED"
    >
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

// 매칭 차수 생성
export async function createMatchingRound(body: CreateMatchingRoundRequest) {
  const { data } = await api.post<ApiResponse<MatchingRoundResponse>>(
    "/v1/project/matching-rounds",
    body,
  )
  return data.result
}

// 매칭 차수 수정
export async function updateMatchingRound(
  matchingRoundId: number,
  body: UpdateMatchingRoundRequest,
) {
  const { data } = await api.patch<ApiResponse<MatchingRoundResponse>>(
    `/v1/project/matching-rounds/${matchingRoundId}`,
    body,
  )
  return data.result
}

// 매칭 차수 삭제
export async function deleteMatchingRound(matchingRoundId: number) {
  const { data } = await api.delete<ApiResponse<unknown>>(
    `/v1/project/matching-rounds/${matchingRoundId}`,
  )
  return data.result
}

// 프로젝트 팀원 추가 (수동 배정)
export async function addProjectMember(
  projectId: number,
  body: { memberId: number; part: string },
) {
  const { data } = await api.post<ApiResponse<unknown>>(
    `/v1/projects/${projectId}/members`,
    body,
  )
  return data.result
}

// 프로젝트 팀원 제거 (매칭 해제)
export async function removeProjectMember(
  projectId: number,
  memberId: number,
  reason?: string,
) {
  const { data } = await api.delete<ApiResponse<unknown>>(
    `/v1/projects/${projectId}/members/${memberId}`,
    { params: reason ? { reason } : undefined },
  )
  return data.result
}

// 프로젝트 지원/매칭 현황 통합 조회 (projectIds 또는 chapterId 중 하나)
export async function getChapterProjectStatistics(params: {
  projectIds?: number[]
  chapterId?: number
}) {
  const { data } = await api.get<ApiResponse<ChapterStatisticsResponse>>(
    "/v1/projects/statistics",
    { params, paramsSerializer: { indexes: null } },
  )
  return data.result
}

// 지부 전체 통계 조회 (admin용 - 지원현황/매칭현황 BFF)
export async function getChapterStatistics(chapterId: number) {
  const { data } = await api.get<ApiResponse<ChapterStatisticsResponse>>(
    "/v1/projects/statistics",
    { params: { chapterId } },
  )
  return data.result
}

// 매칭 현황 집계 조회 (PROJECT-STAT-003, ProjectMember 기준 공개 집계)
export async function getMatchingStatistics(chapterId: number) {
  const { data } = await api.get<
    ApiResponse<ChapterMatchingStatisticsResponse>
  >("/v1/projects/statistics/matchings", { params: { chapterId } })
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
