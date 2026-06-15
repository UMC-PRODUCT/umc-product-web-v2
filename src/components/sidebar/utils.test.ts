import { describe, expect, it } from "vitest"

import { SIDEBAR_ITEMS } from "@/shared/config/navigation"

import { filterSectionsByPermission } from "./utils"

const ALL = {
  canAccessProjectSettings: true,
  canWriteProject: true,
  canAccessProjectManagement: true,
  canManageMatchingRounds: true,
}

function sectionIds(sections: ReturnType<typeof filterSectionsByPermission>) {
  return sections.map((s) => s.id)
}
function menuIds(
  sections: ReturnType<typeof filterSectionsByPermission>,
  sectionId: string,
) {
  return sections.find((s) => s.id === sectionId)?.menus.map((m) => m.id) ?? []
}

describe("filterSectionsByPermission", () => {
  it("전부 허용이면 모든 섹션·항목 노출", () => {
    const result = filterSectionsByPermission(SIDEBAR_ITEMS, ALL)
    expect(sectionIds(result)).toContain("project-settings")
    expect(menuIds(result, "project-settings")).toEqual([
      "project-announce",
      "project-register",
      "project-management",
    ])
    expect(menuIds(result, "team-matching")).toContain("matching-rounds")
  })

  it("그룹 접근 불가면 [프로젝트 설정] 섹션 제거", () => {
    const result = filterSectionsByPermission(SIDEBAR_ITEMS, {
      ...ALL,
      canAccessProjectSettings: false,
    })
    expect(sectionIds(result)).not.toContain("project-settings")
  })

  it("그룹 접근 불가면 프로젝트 capability 값에 무관하게 섹션 제거", () => {
    const result = filterSectionsByPermission(SIDEBAR_ITEMS, {
      canAccessProjectSettings: false,
      canWriteProject: true,
      canAccessProjectManagement: true,
      canManageMatchingRounds: true,
    })
    expect(sectionIds(result)).not.toContain("project-settings")
  })

  it("그룹은 보되 등록·관리 불가면 해당 항목만 숨김", () => {
    const result = filterSectionsByPermission(SIDEBAR_ITEMS, {
      ...ALL,
      canWriteProject: false,
      canAccessProjectManagement: false,
    })
    expect(menuIds(result, "project-settings")).toEqual(["project-announce"])
  })

  it("프로젝트 등록과 관리는 서로 다른 capability로 노출한다", () => {
    const result = filterSectionsByPermission(SIDEBAR_ITEMS, {
      ...ALL,
      canWriteProject: true,
      canAccessProjectManagement: false,
    })
    expect(menuIds(result, "project-settings")).toEqual([
      "project-announce",
      "project-register",
    ])
  })

  it("매칭 차수 관리 불가면 매칭 차수 설정 항목 제거", () => {
    const result = filterSectionsByPermission(SIDEBAR_ITEMS, {
      ...ALL,
      canManageMatchingRounds: false,
    })
    expect(menuIds(result, "team-matching")).not.toContain("matching-rounds")
  })

  it("관리 권한이 없어도 지원 현황 항목 노출", () => {
    const result = filterSectionsByPermission(SIDEBAR_ITEMS, {
      ...ALL,
      canManageMatchingRounds: false,
    })
    expect(menuIds(result, "team-matching")).toContain("matching-applications")
  })

  it("전부 허용이면 지원 현황 항목 노출", () => {
    const result = filterSectionsByPermission(SIDEBAR_ITEMS, ALL)
    expect(menuIds(result, "team-matching")).toContain("matching-applications")
  })
})
