const KAKAO_STATE_KEY = "kakao_oauth_state"
const KAKAO_REDIRECT_URI_ENV = import.meta.env.VITE_KAKAO_REDIRECT_URI as
  | string
  | undefined

export interface KakaoSignInResult {
  accessToken: string
}

export function isKakaoPopupCancelled(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "error" in error &&
    (error as { error: string }).error === "access_denied"
  )
}

export function getKakaoRedirectUri(): string {
  if (KAKAO_REDIRECT_URI_ENV) return KAKAO_REDIRECT_URI_ENV
  return `${window.location.origin}/oauth/kakao/callback`
}

export function consumeKakaoState(state: string | null): boolean {
  const saved = sessionStorage.getItem(KAKAO_STATE_KEY)
  sessionStorage.removeItem(KAKAO_STATE_KEY)
  if (!saved || !state) return false
  return saved === state
}

export function signInWithKakao(): Promise<KakaoSignInResult> {
  return new Promise((resolve, reject) => {
    const appKey = import.meta.env.VITE_KAKAO_APP_KEY as string | undefined

    if (!appKey) {
      reject(new Error("VITE_KAKAO_APP_KEY가 설정되지 않았습니다."))
      return
    }
    if (!window.Kakao) {
      reject(new Error("Kakao SDK가 로드되지 않았습니다."))
      return
    }

    if (!window.Kakao.isInitialized()) {
      window.Kakao.init(appKey)
    }

    window.Kakao.Auth.login({
      success: (authObj) => resolve({ accessToken: authObj.access_token }),
      fail: (err) => reject(err),
      throughTalk: false,
    })
  })
}
