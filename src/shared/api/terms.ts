import { api } from "@/shared/lib/axios"

import type { ApiResponse } from "@/shared/lib/apiResponse"
import type { TermType } from "@/shared/model/domain"

export interface PublicTermResponse {
  id: number
  link: string
  isMandatory: boolean
}

export async function getPublicTermByType(
  termType: TermType,
): Promise<PublicTermResponse> {
  const { data } = await api.get<ApiResponse<PublicTermResponse>>(
    `/v1/terms/type/${termType}`,
  )
  return data.result
}
