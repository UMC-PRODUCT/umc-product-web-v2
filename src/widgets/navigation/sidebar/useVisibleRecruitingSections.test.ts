import { describe, expect, it } from "vitest"

import { RECRUITING_SIDEBAR_ITEMS } from "@/shared/config/recruitingNavigation"

import { filterRecruitingSections } from "./useVisibleRecruitingSections"

function sectionsFor(isCentral: boolean, canEdit = true) {
  return filterRecruitingSections(RECRUITING_SIDEBAR_ITEMS, {
    isCentral,
    canEdit,
  })
}

function titlesFor(isCentral: boolean, canEdit = true) {
  return sectionsFor(isCentral, canEdit).map((section) => section.title)
}

describe("리크루팅 사이드바 역할 필터", () => {
  // 디자인 권한표에 히스토리는 중앙 3종만 있고, 나머지는 서버가 403 을 준다
  it("중앙이 아니면 히스토리가 숨는다", () => {
    expect(titlesFor(false)).not.toContain("히스토리")
  })

  it("중앙은 히스토리까지 본다", () => {
    expect(titlesFor(true)).toContain("히스토리")
  })

  // 디자인은 역할 변형 3종이 모두 같은 사이드바를 쓴다. 히스토리 외에는 감추지 않는다
  it("히스토리 말고는 고칠 수 있는 사람끼리 같은 메뉴를 본다", () => {
    const central = titlesFor(true)
    const others = titlesFor(false)

    expect(central.filter((t) => t !== "히스토리")).toEqual(others)
    expect(others).toEqual(["대시보드", "모집 관리", "평가 관리"])
  })

  it("메뉴 순서는 정의 순서를 유지한다", () => {
    expect(titlesFor(true)).toEqual([
      "대시보드",
      "모집 관리",
      "평가 관리",
      "히스토리",
    ])
  })
})

// 학교 파트장·기타 운영진은 모집을 읽을 수만 있다. 만들기와 평가 운영은 서버가
// 403 을 주므로 메뉴를 열어 두면 눌러서 막힌다
describe("읽기만 가능한 학교 운영진", () => {
  it("평가 관리 섹션이 숨는다", () => {
    expect(titlesFor(false, false)).not.toContain("평가 관리")
  })

  it("모집 관리에서 모집 생성만 빠진다", () => {
    const recruitments = sectionsFor(false, false).find(
      (section) => section.id === "recruiting-recruitments",
    )

    expect(recruitments?.menus.map((menu) => menu.title)).toEqual([
      "모집 목록",
      "모집 인원 설정",
    ])
  })

  it("읽을 수 있는 대시보드는 그대로 남는다", () => {
    const dashboard = sectionsFor(false, false).find(
      (section) => section.id === "recruiting-dashboard",
    )

    expect(dashboard?.menus.map((menu) => menu.title)).toEqual([
      "지원 현황",
      "평가 현황",
    ])
  })

  it("남는 섹션은 대시보드와 모집 관리뿐이다", () => {
    expect(titlesFor(false, false)).toEqual(["대시보드", "모집 관리"])
  })
})
