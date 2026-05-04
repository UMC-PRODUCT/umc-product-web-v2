import { api } from "@/shared/lib/axios"

import type {
  IdPwRegisterMemberRequest,
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

export async function registerMemberByIdPw(
  payload: IdPwRegisterMemberRequest,
): Promise<RegisterResponse> {
  const { data } = await api.post<RegisterResponse>(
    "/v1/member/register/id-pw",
    payload,
  )
  return data
}
