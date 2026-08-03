import { createFileRoute } from "@tanstack/react-router"

import {
  MatchingProjectsListPage,
  validateProjectListSearch,
} from "@/features/project/list"

export const Route = createFileRoute("/projects/")({
  validateSearch: validateProjectListSearch,
  component: ProjectsListRoute,
})

function ProjectsListRoute() {
  const { mock } = Route.useSearch()
  return <MatchingProjectsListPage useMockData={mock === "projects"} />
}
