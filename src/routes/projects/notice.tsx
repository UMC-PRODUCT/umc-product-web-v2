import { createFileRoute } from "@tanstack/react-router"

import { RecruitmentNoticePage } from "@/features/recruiting"
import { createMeta, SITE_URL } from "@/shared/seo"

export const Route = createFileRoute("/projects/notice")({
  head: () =>
    createMeta(
      "모집 공고 | UMC",
      "UMC 학교별 모집 공고와 지원 일정을 확인할 수 있습니다.",
      { canonical: `${SITE_URL}/projects/notice` },
    ),
  component: RecruitmentNoticePage,
})
