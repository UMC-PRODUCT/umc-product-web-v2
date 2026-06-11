import { api } from "@/shared/lib/axios"

import type { TermResponse, Terms, TermType } from "@/features/auth/model/types"
import type { ApiResponse } from "@/shared/lib/apiResponse"

export async function getTermsByType(
  termType: TermType,
): Promise<TermResponse> {
  const { data } = await api.get<ApiResponse<TermResponse>>(
    `/v1/terms/type/${termType}`,
  )
  return data.result
}

export async function getTerms(): Promise<Terms> {
  const { data } = await api.get<ApiResponse<Terms>>("/v1/terms")

  return data.result
}
