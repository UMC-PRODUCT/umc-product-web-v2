import { useAuthStore } from "@/entities/member/store/authStore"
import {
  buildLoginRedirectSearch,
  getCurrentReturnTo,
} from "@/features/auth/lib/loginRedirect"
import { setAuthBridge } from "@/shared/lib/authBridge"

// axios(shared)가 필요로 하는 인증 동작의 실제 구현을 조립 시점에 주입한다.
// 도메인 store(entities)와 로그인 리다이렉트(features)를 아는 곳은 app 레이어뿐이다.
export function wireAuthBridge(): void {
  setAuthBridge({
    getAccessToken: () => useAuthStore.getState().accessToken,
    getRefreshToken: () => useAuthStore.getState().refreshToken,
    setTokens: (tokens) => useAuthStore.getState().setTokens(tokens),
    clear: () => useAuthStore.getState().clear(),
    redirectToLogin: () => {
      const search = new URLSearchParams(
        buildLoginRedirectSearch(getCurrentReturnTo()),
      )
      window.location.href = search.size > 0 ? `/login?${search}` : "/login"
    },
  })
}
