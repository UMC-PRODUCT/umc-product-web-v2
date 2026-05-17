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

  console.log(data.result)
  return data.result
}
