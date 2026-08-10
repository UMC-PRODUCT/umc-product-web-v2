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

// 헤더가 자리를 차지하지 않고 히어로 위에 겹쳐 뜬다. 히어로의 위쪽 여백이 이미
// 헤더 높이를 포함한 값이라 absolute 로 띄운다.
function RecruitingGuideRoute() {
  return (
    <div className="relative">
      <div className="absolute inset-x-0 top-0 z-50">
        <RecruitingHeader tone="glass" />
      </div>
      <RecruitingGuidePage />
    </div>
  )
}
