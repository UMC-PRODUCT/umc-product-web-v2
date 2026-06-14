import { api } from "@/shared/lib/axios"

import type { MemberInfoResponse } from "@/features/challenger/model/types"
import type { ApiResponse } from "@/shared/lib/apiResponse"

export async function getMe(): Promise<MemberInfoResponse> {
  const { data } =
    await api.get<ApiResponse<MemberInfoResponse>>("/v1/member/me")
  return data.result
}
