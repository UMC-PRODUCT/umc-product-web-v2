import { api } from "@/shared/lib/axios"

import type { ApiResponse } from "@/shared/lib/apiResponse"

import type {
  GetApplicationFormResponse,
  UpsertApplicationFormRequest,
  UpsertApplicationFormResponse,
} from "./types"

export async function getApplicationForm(
  projectId: number,
): Promise<GetApplicationFormResponse | null> {
  const { data } = await api.get<
    ApiResponse<GetApplicationFormResponse | null>
  >(`/v1/projects/${projectId}/application-form`)
  return data.result
}

export async function upsertApplicationForm(
  projectId: number,
  body: UpsertApplicationFormRequest,
): Promise<UpsertApplicationFormResponse> {
  const { data } = await api.put<ApiResponse<UpsertApplicationFormResponse>>(
    `/v1/projects/${projectId}/application-form`,
    body,
  )
  return data.result
}
