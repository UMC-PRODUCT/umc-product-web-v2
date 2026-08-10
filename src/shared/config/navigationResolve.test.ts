import { describe, expect, it } from "vitest"

import TeamIcon from "@/shared/assets/icon/people/TeamIcon"
import { SIDEBAR_ITEMS, type SideBarSection } from "@/shared/config/navigation"
import { filterSectionsByPermission } from "@/widgets/navigation/sidebar/utils"

import { resolveNavigationFromPathname } from "./navigationResolve"

function resolveIds(pathname: string) {
  const resolved = resolveNavigationFromPathname(pathname)
  return resolved && { section: resolved.section.id, menu: resolved.menu.id }
}

describe("resolveNavigationFromPathname", () => {
  it("/matching/projects/edit/123은 프로젝트 설정 > 프로젝트 관리로 resolve", () => {
    expect(resolveIds("/matching/projects/edit/123")).toEqual({
      section: "project-settings",
      menu: "project-management",
    })
  })

  it("/matching/projects/edit (id 없음)도 프로젝트 설정 > 프로젝트 관리로 resolve", () => {
    expect(resolveIds("/matching/projects/edit")).toEqual({
      section: "project-settings",
      menu: "project-management",
    })
  })

  it("[회귀] /matching/projects/new는 프로젝트 설정 > 프로젝트 등록 유지", () => {
    expect(resolveIds("/matching/projects/new")).toEqual({
      section: "project-settings",
      menu: "project-register",
    })
  })

  it("[회귀] /matching/projects는 팀 매칭 > 프로젝트 목록 유지", () => {
    expect(resolveIds("/matching/projects")).toEqual({
      section: "team-matching",
      menu: "matching-projects",
    })
  })

  it("[회귀] /matching/projects/management는 프로젝트 설정 > 프로젝트 관리 유지", () => {
    expect(resolveIds("/matching/projects/management")).toEqual({
      section: "project-settings",
      menu: "project-management",
    })
  })

  it("[회귀] /matching은 팀 매칭 > 공지 유지", () => {
    expect(resolveIds("/matching")).toEqual({
      section: "team-matching",
      menu: "matching-announce",
    })
  })

  it("trailing slash는 흡수된다 (/matching/projects/edit/123/)", () => {
    expect(resolveIds("/matching/projects/edit/123/")).toEqual({
      section: "project-settings",
      menu: "project-management",
    })
  })

  it("알 수 없는 경로는 null", () => {
    expect(resolveNavigationFromPathname("/unknown/path")).toBeNull()
  })

  it("to 가 먼저 일치해도 더 긴 matchPaths 별칭이 최장 일치를 가져간다", () => {
    const sections: SideBarSection[] = [
      {
        id: "settings",
        title: "설정",
        icon: TeamIcon,
        menus: [
          {
            id: "manage-root",
            title: "관리",
            to: "/manage",
            matchPaths: ["/manage/school/detail"],
          },
          { id: "manage-school", title: "학교 관리", to: "/manage/school" },
        ],
      },
    ]

    const resolved = resolveNavigationFromPathname(
      "/manage/school/detail",
      sections,
    )
    expect(resolved?.menu.id).toBe("manage-root")
  })

  it("프로젝트 관리 메뉴가 권한으로 제거되면 edit 경로는 별칭을 잃고 팀 매칭으로 fallback", () => {
    const visibleSections = filterSectionsByPermission(SIDEBAR_ITEMS, {
      canAccessProjectSettings: true,
      canWriteProject: true,
      canAccessProjectManagement: false,
      canManageMatchingRounds: true,
    })
    const resolved = resolveNavigationFromPathname(
      "/matching/projects/edit/123",
      visibleSections,
    )
    expect(
      resolved && { section: resolved.section.id, menu: resolved.menu.id },
    ).toEqual({ section: "team-matching", menu: "matching-projects" })
  })
})
