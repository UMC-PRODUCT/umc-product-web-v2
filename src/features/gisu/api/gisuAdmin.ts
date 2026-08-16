import { api } from "@/shared/lib/axios"

import type { ApiResponse } from "@/shared/lib/apiResponse"
import type { components } from "@/types/api"

export type GisuResponse = components["schemas"]["GisuResponse"]
export type GisuPageResponse = components["schemas"]["GisuPageResponse"]
export type CreateGisuRequest = components["schemas"]["CreateGisuRequest"]

export async function getGisuList(params: {
  page: number
  size: number
}): Promise<GisuPageResponse> {
  const { data } = await api.get<ApiResponse<GisuPageResponse>>("/v1/gisu", {
    params,
  })
  return data.result
}

export async function createGisu(body: CreateGisuRequest): Promise<number> {
  const { data } = await api.post<ApiResponse<number>>("/v1/gisu", body)
  return Number(data.result)
}

export async function activateGisu(gisuId: number): Promise<void> {
  await api.post<ApiResponse<void>>(`/v1/gisu/${gisuId}/active`)
}
