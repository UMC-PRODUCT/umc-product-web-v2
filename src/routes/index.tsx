import { createFileRoute, redirect } from "@tanstack/react-router"

import { getViewerBranch } from "@/entities/member/model/identity"
import { useAuthStore } from "@/entities/member/store/authStore"
import { isChapter } from "@/entities/organization/model/chapters"
import { ensureMe } from "@/features/auth/lib/ensureMe"
import {
  CHALLENGER_LANDING_PATH,
  GUEST_LANDING_PATH,
} from "@/shared/config/landingPolicy"

export const Route = createFileRoute("/")({
  beforeLoad: async ({ context }) => {
    if (!useAuthStore.getState().isAuthed) {
      throw redirect({ to: GUEST_LANDING_PATH })
    }

    const me = await ensureMe(context.queryClient)

    // 지부가 없으면 아직 챌린저 인증을 마치지 않은 계정이다. 온보딩을 건너뛰면
    // 인증할 기회가 사라지므로 목적지 정책보다 먼저 본다.
    if (!isChapter(getViewerBranch(me))) {
      throw redirect({ to: "/challenger-verification" })
    }

    // 운영진도 여기로 온다. 리크루팅은 헤더 탭으로 들어간다.
    throw redirect({ to: CHALLENGER_LANDING_PATH })
  },
})
