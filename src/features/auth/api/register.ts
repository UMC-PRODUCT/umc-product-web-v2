import { api } from "@/shared/lib/axios"

import type {
  RegisterMemberRequest,
  RegisterResponse,
} from "@/features/auth/model/types"

export async function registerMemberByOAuth(
  payload: RegisterMemberRequest,
): Promise<RegisterResponse> {
  const { data } = await api.post<RegisterResponse>(
    "/v1/member/register/oauth",
    payload,
  )
  return data
}
