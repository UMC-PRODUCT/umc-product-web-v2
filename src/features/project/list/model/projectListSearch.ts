import type { ProjectPart } from "@/entities/project/api/matchingProject"

import type { ProjectListSearch } from "./matchingProjectList"

const VALID_PARTS = new Set<string>([
  "PLAN",
  "DESIGN",
  "WEB",
  "ANDROID",
  "IOS",
  "NODEJS",
  "SPRINGBOOT",
  "ADMIN",
])

function isProjectPart(value: unknown): value is ProjectPart {
  return typeof value === "string" && VALID_PARTS.has(value)
}

function parsePage(value: unknown): number {
  const parsed =
    typeof value === "string"
      ? Number.parseInt(value, 10)
      : typeof value === "number"
        ? value
        : 1
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : 1
}

// 프로젝트 목록은 매칭(/matching/projects)과 지원자용(/projects) 두 경로에서
// 같은 필터·페이지 파라미터를 쓴다. 파서를 한 곳에 둬서 두 화면이 갈라지지 않게 한다.
export function validateProjectListSearch(
  search: Record<string, unknown>,
): ProjectListSearch {
  let parts: ProjectPart[] | undefined
  if (isProjectPart(search.parts)) {
    parts = [search.parts]
  } else if (Array.isArray(search.parts)) {
    parts = search.parts.filter(isProjectPart)
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
}
