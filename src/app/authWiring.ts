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
      // buildLoginRedirectSearch는 객체를 반환하므로 URLSearchParams로 직렬화한다.
      // .size(비교적 최신 스펙) 대신 toString() 결과로 존재 여부를 판별한다.
      const search = new URLSearchParams(
        buildLoginRedirectSearch(getCurrentReturnTo()),
      ).toString()
      window.location.href = search ? `/login?${search}` : "/login"
    },
  })
}
