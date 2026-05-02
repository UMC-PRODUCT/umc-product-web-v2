import { api } from "@/shared/lib/axios"

import type {
  RegisterMemberRequest,
  RegisterResponse,
} from "@/features/auth/model/types"

export async function registerMember(
  payload: RegisterMemberRequest,
): Promise<RegisterResponse> {
  const { data } = await api.post<RegisterResponse>(
    "/v1/member/register",
    payload,
  )
  return data
}
