import { api } from "@/shared/lib/axios"

import type {
  ChallengerInfoResponse,
  ChallengerRoleResponse,
} from "@/features/challenger/model/types"
import type { ApiResponse } from "@/shared/lib/apiResponse"

export interface MemberInfoResponse {
  id: number
  name: string
  nickname: string
  email: string
  schoolId: number
  schoolName: string
  profileImageLink: string
  status: "ACTIVE" | "INACTIVE" | "WITHDRAWN"
  roles: ChallengerRoleResponse[]
  challengerRecords?: ChallengerInfoResponse[]
}

export async function getMyInfo(): Promise<MemberInfoResponse> {
  const { data } =
    await api.get<ApiResponse<MemberInfoResponse>>("/v1/member/me")
  return data.result
}

export async function updateMemberInfo(body: {
  profileImageId?: string
}): Promise<MemberInfoResponse> {
  const { data } = await api.patch<ApiResponse<MemberInfoResponse>>(
    "/v1/member",
    body,
  )
  return data.result
}

export interface DeleteMemberRequest {
  googleAccessToken?: string
  kakaoAccessToken?: string
}

export async function deleteMember(
  body: DeleteMemberRequest = {},
): Promise<MemberInfoResponse> {
  const { data } = await api.delete<ApiResponse<MemberInfoResponse>>(
    "/v1/member",
    { data: body },
  )
  return data.result
}
