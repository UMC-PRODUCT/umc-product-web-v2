import { createFileRoute } from "@tanstack/react-router"

import { RecruitingApplyGuidePage } from "@/features/recruiting"
import { createMeta, SITE_URL } from "@/shared/seo"

// 로그인 없이 지원할 수 있는 흐름의 첫 화면이라 가드를 두지 않는다.
export const Route = createFileRoute("/projects/apply-guide")({
  head: () =>
    createMeta(
      "지원 방법 | UMC",
      "UMC 지원 절차와 자주 묻는 질문을 확인할 수 있습니다.",
      { canonical: `${SITE_URL}/projects/apply-guide` },
    ),
  component: RecruitingApplyGuidePage,
})
