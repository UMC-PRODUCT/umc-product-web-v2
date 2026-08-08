import { createFileRoute } from "@tanstack/react-router"

import { AboutPage } from "@/features/about/ui/AboutPage"
import { createMeta, SITE_URL } from "@/shared/seo"

export const Route = createFileRoute("/about")({
  head: () =>
    createMeta(
      "UMC 소개 | 대학생 IT 창업 연합 동아리",
      "기획부터 개발까지 가능한 대학생 IT 창업 연합 동아리. 기획자, 디자이너, 개발자가 함께 아이디어를 현실로 만듭니다.",
      { canonical: `${SITE_URL}/about` },
    ),
  component: AboutPage,
})
