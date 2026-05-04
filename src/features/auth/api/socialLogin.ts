import { api } from "@/shared/lib/axios"

import type {
  AppleLoginRequest,
  GoogleLoginRequest,
  KakaoLoginRequest,
  OAuthLoginResponse,
} from "@/features/auth/model/types"
import type { ApiResponse } from "@/shared/lib/apiResponse"

export async function loginWithGoogle(
  payload: GoogleLoginRequest,
): Promise<OAuthLoginResponse> {
  const { data } = await api.post<ApiResponse<OAuthLoginResponse>>(
    "/v1/auth/login/google",
    payload,
  )
  return data.result
}

export async function loginWithKakao(
  payload: KakaoLoginRequest,
): Promise<OAuthLoginResponse> {
  const { data } = await api.post<ApiResponse<OAuthLoginResponse>>(
    "/v1/auth/login/kakao",
    payload,
  )
  return data.result
}

export async function loginWithApple(
  payload: AppleLoginRequest,
): Promise<OAuthLoginResponse> {
  const { data } = await api.post<ApiResponse<OAuthLoginResponse>>(
    "/v1/auth/login/apple",
    payload,
  )
  return data.result
}
