import { api } from "@/shared/lib/axios"

import type { SchoolNameListResponse } from "@/features/auth/model/types"

export async function getAllSchools(): Promise<SchoolNameListResponse> {
  const { data } = await api.get<SchoolNameListResponse>("/v1/schools/all")
  return data
}
