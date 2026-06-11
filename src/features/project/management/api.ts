import { api } from "@/shared/lib/axios"

import type { ApiResponse } from "@/shared/lib/apiResponse"
import type { components } from "@/types/api"

type ManagedProjectSummaryResponse =
  components["schemas"]["ManagedProjectSummaryResponse"]
type PageResponseManagedProjectSummaryResponse =
  components["schemas"]["PageResponseManagedProjectSummaryResponse"]

export type { ManagedProjectSummaryResponse }

export async function getManagedProjects(
  gisuId: number,
  options?: { size?: number },
): Promise<ManagedProjectSummaryResponse[]> {
  const { data } = await api.get<
    ApiResponse<PageResponseManagedProjectSummaryResponse>
  >("/v1/projects/me/managed", { params: { gisuId, size: options?.size } })
  return data.result.content ?? []
}

export async function deleteProject(projectId: number): Promise<void> {
  await api.delete(`/v1/projects/${projectId}`)
}
