import { api } from "@/shared/lib/axios"

import type {
  ChangePasswordRequest,
  EmailLoginRequest,
  EmailLoginResponse,
  LoginIdAvailabilityResponse,
  RegisterCredentialsRequest,
} from "@/features/auth/model/types"
import type { ApiResponse } from "@/shared/lib/apiResponse"

export async function loginWithEmail(
  payload: EmailLoginRequest,
): Promise<EmailLoginResponse> {
  const { data } = await api.post<ApiResponse<EmailLoginResponse>>(
    "/v1/auth/login/email",
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

export async function logout(refreshToken: string) {
  await api.post("/v1/auth/logout", { refreshToken })
}
