import type { OAuthLoginResponse } from "@/features/auth/model/types"

export const OAUTH_VERIFICATION_TOKEN_KEY = "oauth_verification_token"

export function handleLoginResponse(
  res: OAuthLoginResponse,
): "LOGIN_SUCCESS" | "REGISTER_REQUIRED" {
  if (res.code === "LOGIN_SUCCESS") {
    if (!res.accessToken || !res.refreshToken) {
      throw new Error("로그인 응답에 토큰이 없습니다.")
    }
    localStorage.setItem("access_token", res.accessToken)
    localStorage.setItem("refresh_token", res.refreshToken)
    return "LOGIN_SUCCESS"
  }

  sessionStorage.setItem(
    OAUTH_VERIFICATION_TOKEN_KEY,
    res.oAuthVerificationToken ?? "",
  )
  sessionStorage.setItem("oauth_provider", res.provider)
  return "REGISTER_REQUIRED"
}
