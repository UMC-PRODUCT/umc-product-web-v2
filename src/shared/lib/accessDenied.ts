import { useToastStore } from "@/shared/ui/toast/useToastStore"

export const ACCESS_DENIED_MESSAGE = "접근 권한이 없는 화면입니다."

/**
 * 라우트 가드에서 권한 부족으로 되돌려 보낼 때 쓴다.
 *
 * 리다이렉트만 하면 사용자는 주소를 눌렀는데 엉뚱한 화면에 도착한 것으로만
 * 보인다. 링크가 잘못된 건지, 권한이 없는 건지, 로그인이 풀린 건지 구분할 수
 * 없다. 운영진끼리 링크를 공유할 때 특히 헷갈린다.
 *
 * 토스트 스토어는 모듈 전역이라 렌더 밖(beforeLoad)에서도 넣을 수 있고,
 * 도착 화면이 그려질 때 ToastProvider 가 꺼내 보여준다.
 */
export function notifyAccessDenied(message: string = ACCESS_DENIED_MESSAGE) {
  useToastStore.getState().addToast({
    message,
    color: "red",
    variant: "weak",
    type: "default",
    duration: 3000,
  })
}
