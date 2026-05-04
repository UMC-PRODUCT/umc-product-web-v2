export interface GoogleSignInResult {
  accessToken: string
}

export function signInWithGoogle(): Promise<GoogleSignInResult> {
  return new Promise((resolve, reject) => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined
    if (!clientId) {
      reject(new Error("VITE_GOOGLE_CLIENT_ID가 설정되지 않았습니다."))
      return
    }
    if (!window.google?.accounts?.oauth2) {
      reject(new Error("Google Identity Services가 로드되지 않았습니다."))
      return
    }

    const client = window.google.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: "openid email profile",
      callback: (response) => {
        if (response.access_token) {
          resolve({ accessToken: response.access_token })
        } else {
          reject(
            new Error(
              response.error_description ??
                "access_token이 반환되지 않았습니다.",
            ),
          )
        }
      },
      error_callback: (error) => {
        reject(error)
      },
    })

    client.requestAccessToken({ prompt: "" })
  })
}

export function isGooglePopupCancelled(error: unknown): boolean {
  if (typeof error === "object" && error !== null && "type" in error) {
    const type = (error as { type: string }).type
    return type === "popup_closed" || type === "popup_failed_to_open"
  }
  return false
}
