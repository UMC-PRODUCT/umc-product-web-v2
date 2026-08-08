import { createFileRoute } from "@tanstack/react-router"

import { IntroPage } from "@/features/intro/ui/IntroPage"
import { useHeaderRecruitingStatus } from "@/features/recruiting/hooks/useHeaderRecruitingStatus"
import { createMeta, SITE_URL } from "@/shared/seo"

export const Route = createFileRoute("/intro")({
  head: () =>
    createMeta(
      "팀 매칭 시스템 사용 가이드 | UMC",
      "프로젝트 등록·조회부터 지원 폼 제출, 실시간 매칭 결과 확인까지. UMC 데모데이 팀 매칭 시스템 사용 가이드.",
      { canonical: `${SITE_URL}/intro` },
    ),
  component: IntroRoute,
})

// 모집 상태 조회는 라우트가 맡는다. 소개 화면이 리크루팅 훅을 직접 부르면
// 기능끼리 가로로 엮인다.
function IntroRoute() {
  return <IntroPage recruitingStatus={useHeaderRecruitingStatus()} />
}
