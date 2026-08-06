import { describe, expect, it } from "vitest"

import { RECRUITING_SIDEBAR_ITEMS } from "@/shared/config/recruitingNavigation"

import { filterRecruitingSections } from "./useVisibleRecruitingSections"

function titlesFor(isCentral: boolean) {
  return filterRecruitingSections(RECRUITING_SIDEBAR_ITEMS, {
    isCentral,
  }).map((section) => section.title)
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
  it("히스토리 말고는 역할에 따라 사라지는 메뉴가 없다", () => {
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
