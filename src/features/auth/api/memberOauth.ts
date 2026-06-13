import { api } from "@/shared/lib/axios"

import type { MemberOAuthItem } from "@/features/auth/model/types"
import type { ApiResponse } from "@/shared/lib/apiResponse"

export interface UnlinkOAuthRequest {
  googleAccessToken?: string
  kakaoAccessToken?: string
}

export async function getMemberOAuthList(): Promise<MemberOAuthItem[]> {
  const { data } = await api.get<ApiResponse<MemberOAuthItem[]>>(
    "/v1/member-oauth/me",
  )
  return data.result
}

export async function addMemberOAuth(body: {
  oAuthVerificationToken: string
}): Promise<MemberOAuthItem[]> {
  const { data } = await api.post<ApiResponse<MemberOAuthItem[]>>(
    "/v1/member-oauth",
    body,
  )
  return data.result
}

export async function removeMemberOAuth(
  memberOAuthId: number,
  body?: UnlinkOAuthRequest,
): Promise<MemberOAuthItem[]> {
  const { data } = await api.delete<ApiResponse<MemberOAuthItem[]>>(
    `/v1/member-oauth/${memberOAuthId}`,
    { data: body },
  )
  return data.result
}
