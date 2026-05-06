import { api } from "@/shared/lib/axios"

import type { ChallengerInfoResponse } from "@/features/challenger/model/types"
import type { ApiResponse } from "@/shared/lib/apiResponse"

export async function getChallengerInfo(
  challengerId: string,
): Promise<ChallengerInfoResponse> {
  const { data } = await api.get<ApiResponse<ChallengerInfoResponse>>(
    `/v1/challenger/${encodeURIComponent(challengerId)}`,
  )
  return data.result
}
