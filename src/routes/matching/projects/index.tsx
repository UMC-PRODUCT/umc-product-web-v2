// 프로젝트 목록 페이지
import { createFileRoute } from "@tanstack/react-router"

import { MatchingProjectsListPage } from "@/features/project/list"

import type {
  PartQuotaStatus,
  ProjectPart,
} from "@/features/project/list/api/matchingProject"

export type ProjectListSearch = {
  mock?: "projects"
  branch?: string
  school?: string
  parts?: ProjectPart[]
  status?: PartQuotaStatus
  keyword?: string
  page?: number
}

function parsePage(value: unknown): number {
  const parsedPage =
    typeof value === "string"
      ? Number.parseInt(value, 10)
      : typeof value === "number"
        ? value
        : 1

  return Number.isFinite(parsedPage) && parsedPage > 0
    ? Math.floor(parsedPage)
    : 1
}

export const Route = createFileRoute("/matching/projects/")({
  validateSearch: (search: Record<string, unknown>): ProjectListSearch => {
    let parts: ProjectPart[] | undefined
    if (typeof search.parts === "string") {
      parts = [search.parts as ProjectPart]
    } else if (Array.isArray(search.parts)) {
      parts = search.parts.filter(
        (p): p is ProjectPart => typeof p === "string",
      )
    }

    return {
      mock: search.mock === "projects" ? "projects" : undefined,
      branch: typeof search.branch === "string" ? search.branch : undefined,
      school: typeof search.school === "string" ? search.school : undefined,
      parts,
      status:
        search.status === "RECRUITING" || search.status === "COMPLETED"
          ? search.status
          : undefined,
      keyword: typeof search.keyword === "string" ? search.keyword : undefined,
      page: parsePage(search.page),
    }
  },
  component: MatchingProjectsRoute,
})

function MatchingProjectsRoute() {
  const { mock } = Route.useSearch()

  return <MatchingProjectsListPage useMockData={mock === "projects"} />
}
