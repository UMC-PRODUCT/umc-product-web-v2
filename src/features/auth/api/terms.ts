import { api } from "@/shared/lib/axios"

import type { TermResponse, TermType } from "@/features/auth/model/types"

export async function getTermsByType(
  termType: TermType,
): Promise<TermResponse> {
  const { data } = await api.get<TermResponse>(`/v1/terms/type/${termType}`)
  return data
}
