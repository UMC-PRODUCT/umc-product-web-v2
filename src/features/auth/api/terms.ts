import { publicApi } from "@/shared/lib/publicApi"

import type { TermResponse, Terms, TermType } from "@/features/auth/model/types"
import type { ApiResponse } from "@/shared/lib/apiResponse"

export async function getTermsByType(
  termType: TermType,
): Promise<TermResponse> {
  const { data } = await publicApi.get<ApiResponse<TermResponse>>(
    `/v1/terms/type/${termType}`,
  )
  return data.result
}

export async function getTerms(): Promise<Terms> {
  const { data } = await publicApi.get<ApiResponse<Terms>>("/v1/terms")

  return data.result
}
