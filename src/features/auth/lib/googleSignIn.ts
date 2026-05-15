export interface GoogleSignInResult {
  accessToken: string
}

function waitForGsi(timeoutMs = 5000): Promise<void> {
  if (window.google?.accounts?.oauth2) return Promise.resolve()
  return new Promise((resolve, reject) => {
    let elapsed = 0
    const interval = setInterval(() => {
      if (window.google?.accounts?.oauth2) {
        clearInterval(interval)
        resolve()
        return
      }
      elapsed += 50
      if (elapsed >= timeoutMs) {
        clearInterval(interval)
        reject(new Error("Google SDK 로드 시간이 초과되었습니다."))
      }
    }, 50)
  })
}

export function signInWithGoogle(): Promise<GoogleSignInResult> {
  return new Promise((resolve, reject) => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined
    if (!clientId) {
      reject(new Error("VITE_GOOGLE_CLIENT_ID가 설정되지 않았습니다."))
      return
    }

    waitForGsi()
      .then(() => {
        const client = window.google!.accounts.oauth2.initTokenClient({
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
      .catch(reject)
  })
}

export function isGooglePopupCancelled(error: unknown): boolean {
  if (typeof error === "object" && error !== null && "type" in error) {
    const type = (error as { type: string }).type
    return type === "popup_closed" || type === "popup_failed_to_open"
  }
  return false
}
