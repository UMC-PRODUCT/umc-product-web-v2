import { loadAppleSdk } from "./loadAuthSdk"

export interface AppleSignInResult {
  authorizationCode: string
}

export function isApplePopupCancelled(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "error" in error &&
    (error as { error: string }).error === "popup_closed_by_user"
  )
}

export async function signInWithApple(): Promise<AppleSignInResult> {
  const clientId = import.meta.env.VITE_APPLE_CLIENT_ID as string | undefined
  const redirectURI = import.meta.env.VITE_APPLE_REDIRECT_URI as
    | string
    | undefined

  if (!clientId || !redirectURI) {
    throw new Error("Apple Sign In 환경변수가 설정되지 않았습니다.")
  }

  await loadAppleSdk()

  if (!window.AppleID?.auth) {
    throw new Error("Apple Sign In SDK가 로드되지 않았습니다.")
  }

  window.AppleID.auth.init({
    clientId,
    scope: "name email",
    redirectURI,
    usePopup: true,
  })

  const response = await window.AppleID.auth.signIn()
  return {
    authorizationCode: response.authorization.code,
  }
}
