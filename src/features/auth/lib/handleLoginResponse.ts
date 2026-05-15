import type { OAuthLoginResponse } from "@/features/auth/model/types"

export const OAUTH_VERIFICATION_TOKEN_KEY = "oauth_verification_token"

export function handleLoginResponse(
  res: OAuthLoginResponse,
): "LOGIN_SUCCESS" | "REGISTER_REQUIRED" {
  if (res.code === "LOGIN_SUCCESS") {
    localStorage.setItem("access_token", res.accessToken ?? "")
    localStorage.setItem("refresh_token", res.refreshToken ?? "")
    return "LOGIN_SUCCESS"
  }

  sessionStorage.setItem(
    OAUTH_VERIFICATION_TOKEN_KEY,
    res.oAuthVerificationToken ?? "",
  )
  sessionStorage.setItem("oauth_provider", res.provider)
  return "REGISTER_REQUIRED"
}
