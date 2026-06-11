import { describe, expect, it } from "vitest"

import { SIDEBAR_ITEMS } from "@/shared/config/navigation"

import { filterSectionsByPermission } from "./utils"

const ALL = {
  canAccessProjectSettings: true,
  canManageProjects: true,
  canManageRecruitment: true,
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

  it("그룹 접근 불가면 canManageProjects 값에 무관하게 섹션 제거", () => {
    const result = filterSectionsByPermission(SIDEBAR_ITEMS, {
      canAccessProjectSettings: false,
      canManageProjects: true,
      canManageRecruitment: true,
    })
    expect(sectionIds(result)).not.toContain("project-settings")
  })

  it("그룹은 보되 관리 불가면 등록·관리 항목만 숨김(공지는 노출)", () => {
    const result = filterSectionsByPermission(SIDEBAR_ITEMS, {
      ...ALL,
      canManageProjects: false,
    })
    expect(menuIds(result, "project-settings")).toEqual(["project-announce"])
  })

  it("recruitment 불가면 매칭 차수 설정 항목 제거", () => {
    const result = filterSectionsByPermission(SIDEBAR_ITEMS, {
      ...ALL,
      canManageRecruitment: false,
    })
    expect(menuIds(result, "team-matching")).not.toContain("matching-rounds")
  })
})
