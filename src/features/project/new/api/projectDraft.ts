import { api } from "@/shared/lib/axios"

import type { ApiResponse } from "@/shared/lib/apiResponse"

import type {
  CreateDraftProjectRequest,
  DraftProjectResponse,
  ProjectDetailResponse,
  ProjectStatusResponse,
  UpdateProjectRequest,
} from "./types"

export async function createProjectDraft(
  payload: CreateDraftProjectRequest,
): Promise<ProjectStatusResponse> {
  const { data } = await api.post<ApiResponse<ProjectStatusResponse>>(
    "/v1/projects",
    payload,
  )
  return data.result
}

export async function updateProjectDraft(
  projectId: number,
  patch: UpdateProjectRequest,
): Promise<ProjectStatusResponse> {
  const { data } = await api.patch<ApiResponse<ProjectStatusResponse>>(
    `/v1/projects/${projectId}`,
    patch,
  )
  return data.result
}

export async function getMyDraft(
  gisuId: number,
): Promise<DraftProjectResponse | null> {
  const { data } = await api.get<ApiResponse<DraftProjectResponse | null>>(
    "/v1/projects/me/draft",
    { params: { gisuId } },
  )
  return data.result ?? null
}

export async function submitProject(
  projectId: number,
): Promise<ProjectStatusResponse> {
  const { data } = await api.post<ApiResponse<ProjectStatusResponse>>(
    `/v1/projects/${projectId}/submit`,
  )
  return data.result
}

export async function getProjectDetail(
  projectId: number,
): Promise<ProjectDetailResponse> {
  const { data } = await api.get<ApiResponse<ProjectDetailResponse>>(
    `/v1/projects/${projectId}`,
  )
  return data.result
}
