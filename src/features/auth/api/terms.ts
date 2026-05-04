import { api } from "@/shared/lib/axios"

import type { TermResponse, TermType } from "@/features/auth/model/types"
import type { ApiResponse } from "@/shared/lib/apiResponse"

export async function getTermsByType(
  termType: TermType,
): Promise<TermResponse> {
  const { data } = await api.get<ApiResponse<TermResponse>>(
    `/v1/terms/type/${termType}`,
  )
  return data.result
}
