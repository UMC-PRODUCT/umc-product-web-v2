import { api } from "@/shared/lib/axios"

import type {
  MemberInfoResponse,
  SearchMemberParams,
  SearchMemberResponse,
} from "@/features/challenger/model/types"
import type { ApiResponse } from "@/shared/lib/apiResponse"

export async function searchMembers(
  params: SearchMemberParams,
): Promise<SearchMemberResponse> {
  const { data } = await api.get<ApiResponse<SearchMemberResponse>>(
    "/v1/member/search",
    { params },
  )
  return data.result
}

export async function getMemberProfile(
  memberId: string,
): Promise<MemberInfoResponse> {
  const { data } = await api.get<ApiResponse<MemberInfoResponse>>(
    `/v1/member/profile/${encodeURIComponent(memberId)}`,
  )
  return data.result
}
