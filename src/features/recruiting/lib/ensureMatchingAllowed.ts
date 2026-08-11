import { redirect } from "@tanstack/react-router"

import { isWithinHeaderRecruitingWindow } from "@/shared/config/headerRecruitingWindow"
import { useToastStore } from "@/shared/ui/toast/useToastStore"

/** 모집 기간에 매칭으로 들어오면 여기로 돌려보낸다. */
const FALLBACK_PATH = "/projects"

/**
 * 모집 기간에는 매칭 화면으로 들어갈 수 없다.
 *
 * 로그인 직후 착지 경로만 막으면 부족하다. 주소를 직접 치거나 이전 기록으로
 * 돌아오는 경로가 남아, 진입 자체를 라우트 진입 지점에서 끊는다. `/matching` 아래
 * 화면은 모두 이 라우트를 부모로 두므로 여기 한 곳이면 전부 덮는다.
 *
 * 역할 예외를 두지 않는다. 운영진도 같은 규칙을 받는다.
 *
 * 기간 판정을 서버 차수가 아니라 하드코딩한 창으로 한다. 이유가 둘이다.
 *
 * 첫째, 실제 지원 기간이 오기 전에 QA 로 이 차단이 제대로 도는지 확인해야 한다.
 * 서버 차수에 매이면 차수가 열리기 전에는 막히는 화면을 재현할 방법이 없어, 정작
 * 기간이 시작된 뒤에야 처음 동작을 보게 된다. 창은 값만 옮기면 QA 기간에 그대로
 * 재현된다.
 *
 * 둘째, 서버 차수 목록(`useHeaderRecruitingStatus`)으로 판정하면 아직 아무 학교도
 * 차수를 열지 않은 동안 "모집 기간이 아니다" 가 되어 매칭이 그대로 열린다. 헤더가
 * 지원 진입로를 띄우는 근거와 같은 값을 쓴다.
 *
 * TODO: headerRecruitingWindow 는 차수가 열리는 대로 지우기로 되어 있다. 그때 이
 * 판정도 함께 옮겨야 한다. 한쪽만 옮기면 헤더는 모집 중이라고 하는데 매칭은 열려
 * 있는 상태가 생긴다. 다만 옮기더라도 위 QA 요구는 남으므로, 차수와 무관하게 기간을
 * 강제할 수단은 어떤 형태로든 남겨 두어야 한다.
 */
export function ensureMatchingAllowed(): void {
  if (!isWithinHeaderRecruitingWindow()) return

  useToastStore.getState().addToast({
    message: "모집 기간에는 접근할 수 없는 경로입니다.",
    color: "red",
    variant: "deep",
    type: "default",
    duration: 3000,
  })

  throw redirect({ to: FALLBACK_PATH })
}
