import { PROJECT_PARTS } from "@/entities/project/api/matchingProject"

import type { ProjectPart } from "@/entities/project/api/matchingProject"

import type { ProjectListSearch } from "./matchingProjectList"

// 파트 목록은 타입과 같은 출처에서 온다. 여기에 다시 나열하면 파트가 늘었을 때
// 타입 검사에 걸리지 않은 채 새 파트만 조용히 빠진다.
const VALID_PARTS = new Set<string>(PROJECT_PARTS)

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
  // 고른 파트가 없다는 뜻은 undefined 하나로만 표현한다. 걸러 낸 결과가 빈 배열로
  // 남으면 같은 의미를 두 가지 값으로 흘려보내게 된다.
  let parts: ProjectPart[] | undefined
  if (isProjectPart(search.parts)) {
    parts = [search.parts]
  } else if (Array.isArray(search.parts)) {
    const valid = search.parts.filter(isProjectPart)
    parts = valid.length > 0 ? valid : undefined
  }

  return {
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
