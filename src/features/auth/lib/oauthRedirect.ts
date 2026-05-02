import type { OAuthProvider } from "@/features/auth/model/types"

const PROVIDER_PATH: Record<OAuthProvider, string> = {
  GOOGLE: "google",
  KAKAO: "kakao",
}

export function redirectToOAuth(provider: OAuthProvider) {
  const baseUrl = import.meta.env.VITE_API_BASE_URL
  if (!baseUrl) {
    console.error("VITE_API_BASE_URL is not defined")
    return
  }
  window.location.href = `${baseUrl}/v1/auth/oauth2/authorization/${PROVIDER_PATH[provider]}`
}
