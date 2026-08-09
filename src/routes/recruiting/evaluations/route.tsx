import { createFileRoute, Outlet, redirect } from "@tanstack/react-router"

import { isRecruitingEditor } from "@/entities/member/model/identity"
import { ensureMe } from "@/features/auth/lib/ensureMe"
import { RECRUITING_HOME_PATH } from "@/shared/config/landingPolicy"
import { notifyAccessDenied } from "@/shared/lib/accessDenied"

// 평가 관리는 서버가 학교 회장단까지만 허용한다(평가자 배정·면접 세션 모두 403).
// 사이드바에서 감추는 것만으로는 주소를 직접 친 진입을 막지 못한다.
export const Route = createFileRoute("/recruiting/evaluations")({
  beforeLoad: async ({ context, location }) => {
    const me = await ensureMe(context.queryClient, location.href)
    if (!isRecruitingEditor(me)) {
      notifyAccessDenied()
      throw redirect({ to: RECRUITING_HOME_PATH })
    }
  },
  component: Outlet,
})
