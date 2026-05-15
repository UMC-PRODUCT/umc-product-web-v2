const KAKAO_REDIRECT_PATH = "/oauth/kakao/callback"
const KAKAO_STATE_STORAGE_KEY = "kakao_oauth_state"

export function getKakaoRedirectUri(): string {
  return `${window.location.origin}${KAKAO_REDIRECT_PATH}`
}

export function consumeKakaoState(received: string | null): boolean {
  const saved = sessionStorage.getItem(KAKAO_STATE_STORAGE_KEY)
  sessionStorage.removeItem(KAKAO_STATE_STORAGE_KEY)
  return Boolean(saved) && saved === received
}

export function startKakaoSignIn(): void {
  const appKey = import.meta.env.VITE_KAKAO_APP_KEY as string | undefined

  if (!appKey) {
    throw new Error("VITE_KAKAO_APP_KEY가 설정되지 않았습니다.")
  }
  if (!window.Kakao) {
    throw new Error("Kakao SDK가 로드되지 않았습니다.")
  }

  if (!window.Kakao.isInitialized()) {
    window.Kakao.init(appKey)
  }

  const state = crypto.randomUUID()
  sessionStorage.setItem(KAKAO_STATE_STORAGE_KEY, state)

  window.Kakao.Auth.authorize({
    redirectUri: getKakaoRedirectUri(),
    state,
  })
}
