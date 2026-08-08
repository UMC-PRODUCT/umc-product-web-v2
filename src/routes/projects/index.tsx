import { createFileRoute } from "@tanstack/react-router"

import {
  MatchingProjectsListPage,
  validateProjectListSearch,
} from "@/features/project/list"
import { createMeta, SITE_URL } from "@/shared/seo"

export const Route = createFileRoute("/projects/")({
  // 비로그인 유입 진입로라 색인시킨다. 지원 대상자가 검색으로 닿아야 한다.
  head: () =>
    createMeta(
      "프로젝트 | UMC",
      "UMC 에서 진행 중인 프로젝트를 학교·파트별로 확인할 수 있습니다.",
      { canonical: `${SITE_URL}/projects` },
    ),
  validateSearch: validateProjectListSearch,
  component: ProjectsListRoute,
})

function ProjectsListRoute() {
  // 이 화면은 사이드바 없이 전폭이라 로그인 여부와 상관없이 3열이다.
  return <MatchingProjectsListPage columns={3} />
}
