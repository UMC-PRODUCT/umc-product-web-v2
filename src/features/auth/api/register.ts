import { api } from "@/shared/lib/axios"

import type {
  IdPwRegisterMemberRequest,
  RegisterMemberRequest,
  RegisterResponse,
} from "@/features/auth/model/types"
import type { ApiResponse } from "@/shared/lib/apiResponse"

export async function registerMemberByOAuth(
  payload: RegisterMemberRequest,
): Promise<RegisterResponse> {
  const { data } = await api.post<ApiResponse<RegisterResponse>>(
    "/v1/member/register/oauth",
    payload,
  )
  return data.result
}

export async function registerMemberByIdPw(
  payload: IdPwRegisterMemberRequest,
): Promise<RegisterResponse> {
  const { data } = await api.post<ApiResponse<RegisterResponse>>(
    "/v1/member/register/id-pw",
    payload,
  )
  return data.result
}
