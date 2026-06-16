import { rememberLoginReturnTo } from "./loginRedirect"

const KAKAO_REDIRECT_PATH = "/oauth/kakao/callback"
const KAKAO_STATE_STORAGE_KEY = "kakao_oauth_state"
const KAKAO_LINK_INTENT_KEY = "kakao_link_intent"

function generateSecureState(): string {
  if (typeof crypto?.randomUUID === "function") {
    return crypto.randomUUID()
  }
  if (typeof crypto?.getRandomValues === "function") {
    const bytes = new Uint8Array(16)
    crypto.getRandomValues(bytes)
    return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("")
  }
  throw new Error("보안 난수 생성기를 사용할 수 없습니다.")
}

export function getKakaoRedirectUri(): string {
  return `${window.location.origin}${KAKAO_REDIRECT_PATH}`
}

export function consumeKakaoState(received: string | null): boolean {
  const saved = sessionStorage.getItem(KAKAO_STATE_STORAGE_KEY)
  sessionStorage.removeItem(KAKAO_STATE_STORAGE_KEY)
  return Boolean(saved) && saved === received
}

export function setKakaoLinkIntent(): void {
  sessionStorage.setItem(KAKAO_LINK_INTENT_KEY, "link")
}

export function consumeKakaoLinkIntent(): boolean {
  const intent = sessionStorage.getItem(KAKAO_LINK_INTENT_KEY)
  sessionStorage.removeItem(KAKAO_LINK_INTENT_KEY)
  return intent === "link"
}

export function startKakaoSignIn(returnTo?: string): void {
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

  const state = generateSecureState()
  sessionStorage.setItem(KAKAO_STATE_STORAGE_KEY, state)
  rememberLoginReturnTo(returnTo)

  window.Kakao.Auth.authorize({
    redirectUri: getKakaoRedirectUri(),
    state,
  })
}
