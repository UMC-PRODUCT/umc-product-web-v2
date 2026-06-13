// 프로젝트 목록 페이지
import { createFileRoute } from "@tanstack/react-router"

import { MatchingProjectsListPage } from "@/features/project/list"

export const Route = createFileRoute("/matching/projects/")({
  validateSearch: (search: Record<string, unknown>): { mock?: "projects" } =>
    search.mock === "projects" ? { mock: "projects" } : {},
  component: MatchingProjectsRoute,
})

function MatchingProjectsRoute() {
  const { mock } = Route.useSearch()

  return <MatchingProjectsListPage useMockData={mock === "projects"} />
}
