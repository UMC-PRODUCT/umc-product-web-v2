import { useAuthStore } from "@/entities/member/store/authStore"
import { setAuthBridge } from "@/shared/lib/authBridge"
import {
  buildLoginRedirectSearch,
  getCurrentReturnTo,
} from "@/shared/lib/loginRedirect"

// axios(shared)가 필요로 하는 인증 동작의 실제 구현을 조립 시점에 주입한다.
// 도메인 store(entities/member)를 shared에 노출하지 않기 위해 app에서 주입한다.
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
