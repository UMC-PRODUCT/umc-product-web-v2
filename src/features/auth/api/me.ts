import { api } from "@/shared/lib/axios"

export interface MemberInfoResponse {
  id: number
  name: string
  nickname: string
  email: string
  schoolId: number
  schoolName: string
  profileImageLink: string
  status: "ACTIVE" | "INACTIVE" | "WITHDRAWN"
}

export async function getMyInfo(): Promise<MemberInfoResponse> {
  const { data } = await api.get<MemberInfoResponse>("/v1/member/me")
  return data
}
