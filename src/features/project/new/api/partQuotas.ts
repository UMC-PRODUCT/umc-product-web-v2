import { api } from "@/shared/lib/axios"

import type { ApiResponse } from "@/shared/lib/apiResponse"

import type { UpdatePartQuotasRequest } from "./types"

export async function updatePartQuotas(
  projectId: number,
  body: UpdatePartQuotasRequest,
): Promise<void> {
  await api.put<ApiResponse<void>>(
    `/v1/projects/${projectId}/part-quotas`,
    body,
  )
}
