import { createFileRoute } from "@tanstack/react-router"

import { RecruitingApplyPage } from "@/features/recruiting"

export const Route = createFileRoute("/projects/apply/$roundId")({
  // 개인 지원 정보라 색인시키지 않는다.
  head: () => ({
    meta: [{ name: "robots", content: "noindex, nofollow" }],
  }),
  component: RecruitingApplyRoute,
})

function RecruitingApplyRoute() {
  const { roundId } = Route.useParams()
  return <RecruitingApplyPage key={roundId} roundId={roundId} />
}
