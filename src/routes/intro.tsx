import { createFileRoute } from "@tanstack/react-router"

import { IntroPage } from "@/features/intro/ui/IntroPage"
import { createMeta, SITE_URL } from "@/shared/seo"

export const Route = createFileRoute("/intro")({
  head: () =>
    createMeta(
      "팀 매칭 시스템 사용 가이드 | UMC",
      "프로젝트 등록·조회부터 지원 폼 제출, 실시간 매칭 결과 확인까지. UMC 데모데이 팀 매칭 시스템 사용 가이드.",
      { canonical: `${SITE_URL}/intro` },
    ),
  component: IntroPage,
})
