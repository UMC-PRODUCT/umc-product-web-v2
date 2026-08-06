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
  const { mock } = Route.useSearch()
  return <MatchingProjectsListPage useMockData={mock === "projects"} />
}
