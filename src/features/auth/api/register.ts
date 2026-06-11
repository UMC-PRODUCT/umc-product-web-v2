import { api } from "@/shared/lib/axios"

import type {
  EmailRegisterMemberRequest,
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

export async function registerMemberByEmail(
  payload: EmailRegisterMemberRequest,
): Promise<RegisterResponse> {
  const { data } = await api.post<ApiResponse<RegisterResponse>>(
    "/v1/member/register/email",
    payload,
  )
  return data.result
}
