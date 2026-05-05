import { api } from "@/shared/lib/axios"

import type {
  ChangePasswordRequest,
  IdPwLoginRequest,
  IdPwLoginResponse,
  LoginIdAvailabilityResponse,
  RegisterCredentialsRequest,
} from "@/features/auth/model/types"
import type { ApiResponse } from "@/shared/lib/apiResponse"

export async function loginWithIdPw(
  payload: IdPwLoginRequest,
): Promise<IdPwLoginResponse> {
  const { data } = await api.post<ApiResponse<IdPwLoginResponse>>(
    "/v1/auth/login/id-pw",
    payload,
  )
  return data.result
}

export async function registerCredentials(
  payload: RegisterCredentialsRequest,
): Promise<void> {
  await api.post("/v1/auth/credentials", payload)
}

export async function checkLoginIdAvailability(
  loginId: string,
): Promise<LoginIdAvailabilityResponse> {
  const { data } = await api.get<ApiResponse<LoginIdAvailabilityResponse>>(
    "/v1/auth/login-id/availability",
    { params: { loginId } },
  )
  return data.result
}

export async function changePassword(
  payload: ChangePasswordRequest,
): Promise<void> {
  await api.patch("/v1/auth/password", payload)
}
