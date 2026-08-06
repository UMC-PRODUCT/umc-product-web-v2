import { createFileRoute, redirect } from "@tanstack/react-router"

import {
  getViewerBranch,
  isAnyOperator,
} from "@/entities/member/model/identity"
import { useAuthStore } from "@/entities/member/store/authStore"
import { isChapter } from "@/entities/organization/model/chapters"
import { ensureMe } from "@/features/auth/lib/ensureMe"
import {
  CHALLENGER_LANDING_PATH,
  GUEST_LANDING_PATH,
  OPERATOR_LANDING_PATH,
} from "@/shared/config/landingPolicy"

export const Route = createFileRoute("/")({
  beforeLoad: async ({ context }) => {
    if (!useAuthStore.getState().isAuthed) {
      throw redirect({ to: GUEST_LANDING_PATH })
    }

    const me = await ensureMe(context.queryClient)

    // 학교 운영진까지 포함한다. isOperator 는 학교 역할을 빼고 있어서, 교내
    // 회장이 리크루팅을 쓰는데도 매칭으로 떨어지고 있었다.
    if (isAnyOperator(me)) {
      throw redirect({ to: OPERATOR_LANDING_PATH })
    }

    // 지부가 없으면 아직 챌린저 인증을 마치지 않은 계정이다. 온보딩을 건너뛰면
    // 인증할 기회가 사라지므로 목적지 정책보다 먼저 본다.
    if (!isChapter(getViewerBranch(me))) {
      throw redirect({ to: "/challenger-verification" })
    }

    throw redirect({ to: CHALLENGER_LANDING_PATH })
  },
})
