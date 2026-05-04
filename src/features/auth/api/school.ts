import { api } from "@/shared/lib/axios"

import type { SchoolNameListResponse } from "@/features/auth/model/types"
import type { ApiResponse } from "@/shared/lib/apiResponse"

export async function getAllSchools(): Promise<SchoolNameListResponse> {
  const { data } =
    await api.get<ApiResponse<SchoolNameListResponse>>("/v1/schools/all")
  return data.result
}
