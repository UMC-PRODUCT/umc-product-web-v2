import type { OAuthLoginResponse } from "@/features/auth/model/types"

export function handleLoginResponse(
  res: OAuthLoginResponse,
): "LOGIN_SUCCESS" | "REGISTER_REQUIRED" {
  if (res.code === "LOGIN_SUCCESS") {
    localStorage.setItem("access_token", res.accessToken ?? "")
    localStorage.setItem("refresh_token", res.refreshToken ?? "")
    return "LOGIN_SUCCESS"
  }

  sessionStorage.setItem(
    "oauth_verification_token",
    res.oAuthVerificationToken ?? "",
  )
  sessionStorage.setItem("oauth_provider", res.provider)
  return "REGISTER_REQUIRED"
}
