import { createFileRoute, redirect } from "@tanstack/react-router"

import {
  getViewerBranch,
  isRecruitingOperator,
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

    // 리크루팅 진입 가드와 같은 판정을 써야 한다. 여기서 더 넓게 보내면
    // 가드가 되돌려보내고 다시 여기로 와서 무한히 오간다.
    if (isRecruitingOperator(me)) {
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
