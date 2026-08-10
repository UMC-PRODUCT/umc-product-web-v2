import { createFileRoute } from "@tanstack/react-router"

import { RecruitingGuidePage } from "@/features/about/ui/RecruitingGuidePage"
import { createMeta, SITE_URL } from "@/shared/seo"
import RecruitingHeader from "@/widgets/navigation/header/RecruitingHeader"

export const Route = createFileRoute("/recruiting-guide")({
  head: () =>
    createMeta(
      "모집 안내 | UMC 11기",
      "UMC 11기 모집 분야와 모집 일정, 함께하는 학교, 자주 묻는 질문을 한 번에 확인하세요.",
      { canonical: `${SITE_URL}/recruiting-guide` },
    ),
  component: RecruitingGuideRoute,
})

function RecruitingGuideRoute() {
  return (
    <div className="relative">
      <div className="sticky top-0 z-50 -mb-20">
        <RecruitingHeader tone="glass" />
      </div>
      <RecruitingGuidePage />
    </div>
  )
}
