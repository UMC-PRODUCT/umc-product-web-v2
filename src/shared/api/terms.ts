import { api } from "@/shared/lib/axios"

import type { ApiResponse } from "@/shared/lib/apiResponse"
import type { TermType } from "@/shared/model/domain"

interface RawPublicTermResponse {
  id: number | string
  link: string
  isMandatory: boolean
}

export interface PublicTermResponse {
  id: number
  link: string
  isMandatory: boolean
}

export async function getPublicTermByType(
  termType: TermType,
): Promise<PublicTermResponse> {
  const { data } = await api.get<ApiResponse<RawPublicTermResponse>>(
    `/v1/terms/type/${termType}`,
  )
  const rawId = data.result.id
  if (
    typeof rawId !== "number" &&
    (typeof rawId !== "string" || rawId.trim() === "")
  ) {
    throw new Error("invalid public term id")
  }

  const id = Number(rawId)
  if (!Number.isSafeInteger(id)) throw new Error("invalid public term id")
  return { ...data.result, id }
}
