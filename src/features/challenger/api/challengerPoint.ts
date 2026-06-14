import { api } from "@/shared/lib/axios"

import type {
  ChallengerInfoResponse,
  GrantChallengerPointRequest,
} from "@/features/challenger/model/types"
import type { ApiResponse } from "@/shared/lib/apiResponse"

export async function grantChallengerPoints(
  challengerId: string,
  payload: GrantChallengerPointRequest,
): Promise<ChallengerInfoResponse> {
  const { data } = await api.post<ApiResponse<ChallengerInfoResponse>>(
    `/v1/challenger/${encodeURIComponent(challengerId)}/points`,
    payload,
  )
  return data.result
}
