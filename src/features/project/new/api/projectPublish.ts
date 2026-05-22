import { api } from "@/shared/lib/axios"

import type { ApiResponse } from "@/shared/lib/apiResponse"

import type { ProjectStatusResponse } from "./types"

export async function publishProject(
  projectId: number,
): Promise<ProjectStatusResponse> {
  const { data } = await api.post<ApiResponse<ProjectStatusResponse>>(
    `/v1/projects/${projectId}/publish`,
  )
  return data.result
}
