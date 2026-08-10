import { createFileRoute } from "@tanstack/react-router"

import { AboutPage } from "@/features/about/ui/AboutPage"
import { createMeta, SITE_URL } from "@/shared/seo"
import RecruitingHeader from "@/widgets/navigation/header/RecruitingHeader"

export const Route = createFileRoute("/about")({
  head: () =>
    createMeta(
      "UMC 소개 | 대학생 IT 창업 연합 동아리",
      "기획부터 개발까지 가능한 대학생 IT 창업 연합 동아리. 기획자, 디자이너, 개발자가 함께 아이디어를 현실로 만듭니다.",
      { canonical: `${SITE_URL}/about` },
    ),
  component: AboutRoute,
})

// 시안은 헤더가 자리를 차지하지 않고 히어로 위에 겹쳐 뜬다(mb-[-80px]). 히어로의
// 위쪽 여백이 이미 헤더 높이를 포함한 값이라 absolute 로 띄운다.
function AboutRoute() {
  return (
    <div className="about-landing relative">
      <div className="absolute inset-x-0 top-0 z-50">
        <RecruitingHeader tone="glass" />
      </div>
      <AboutPage />
    </div>
  )
}
