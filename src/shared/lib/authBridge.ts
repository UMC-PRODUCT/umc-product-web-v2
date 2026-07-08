// axios 인터셉터가 인증 상태(토큰 조회/저장, 로그아웃, 로그인 리다이렉트)에
// 접근하기 위한 주입 지점. shared는 도메인(entities/member)이나 feature(auth)를
// 알아서는 안 되므로, 실제 구현은 app 조립 시점에 setAuthBridge로 주입한다.
// (의존성 역전: shared는 인터페이스만 소유하고 상위 레이어가 구현을 제공)

export interface AuthBridge {
  getAccessToken: () => string | null
  getRefreshToken: () => string | null
  setTokens: (tokens: { accessToken: string; refreshToken: string }) => void
  clear: () => void
  redirectToLogin: () => void
}

let bridge: AuthBridge | null = null

export function setAuthBridge(impl: AuthBridge): void {
  bridge = impl
}

function ensure(): AuthBridge {
  if (!bridge) {
    throw new Error(
      "AuthBridge가 주입되지 않았습니다. app 초기화 시 wireAuthBridge()를 호출하세요.",
    )
  }
  return bridge
}

export const authBridge: AuthBridge = {
  getAccessToken: () => ensure().getAccessToken(),
  getRefreshToken: () => ensure().getRefreshToken(),
  setTokens: (tokens) => ensure().setTokens(tokens),
  clear: () => ensure().clear(),
  redirectToLogin: () => ensure().redirectToLogin(),
}
