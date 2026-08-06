import { createFileRoute } from "@tanstack/react-router"

import { ensureMe } from "@/features/auth/lib/ensureMe"
import { RecruitingApplyPage } from "@/features/recruiting"

export const Route = createFileRoute("/projects/apply/$roundId")({
  // 개인 지원 정보라 색인시키지 않는다.
  head: () => ({
    meta: [{ name: "robots", content: "noindex, nofollow" }],
  }),
  // /projects 레이아웃에는 로그인 가드가 없다. 지원서 작성은 로그인 사용자
  // 경로만 구현하므로 이 라우트에서 직접 건다.
  beforeLoad: async ({ context, location }) => {
    await ensureMe(context.queryClient, location.href)
  },
  component: RecruitingApplyRoute,
})

function RecruitingApplyRoute() {
  const { roundId } = Route.useParams()
  return <RecruitingApplyPage key={roundId} roundId={roundId} />
}
