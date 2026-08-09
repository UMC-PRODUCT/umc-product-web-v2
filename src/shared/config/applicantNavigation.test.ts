import { describe, expect, it } from "vitest"

import { resolveFlatNavItemId } from "@/shared/config/navigationResolve"

import {
  APPLICANT_SIDEBAR_ITEMS,
  isApplicantFlowPath,
} from "./applicantNavigation"

function activeAt(pathname: string) {
  return resolveFlatNavItemId(pathname, APPLICANT_SIDEBAR_ITEMS)
}

describe("지원자 사이드바 노출 범위", () => {
  // 프로젝트 목록은 디자인상 사이드바 없이 전폭이다
  it("프로젝트 목록에는 붙지 않는다", () => {
    expect(isApplicantFlowPath("/projects")).toBe(false)
  })

  it("지원하기 흐름에는 붙는다", () => {
    expect(isApplicantFlowPath("/projects/apply-guide")).toBe(true)
    expect(isApplicantFlowPath("/projects/notice")).toBe(true)
    expect(isApplicantFlowPath("/projects/apply/12")).toBe(true)
    expect(isApplicantFlowPath("/projects/application")).toBe(true)
    expect(isApplicantFlowPath("/projects/application/list")).toBe(true)
  })

  // 접두사만 보면 이름이 겹치는 다른 화면이 지원 흐름으로 딸려 들어온다
  it("이름이 겹치는 다른 경로는 붙지 않는다", () => {
    expect(isApplicantFlowPath("/projects/applications")).toBe(false)
    expect(isApplicantFlowPath("/projects/notice-archive")).toBe(false)
    expect(isApplicantFlowPath("/projects/apply-guide-archive")).toBe(false)
  })
})

describe("지원자 사이드바 활성 항목", () => {
  it("화면마다 해당 항목이 켜진다", () => {
    expect(activeAt("/projects/apply-guide")).toBe("applicant-guide")
    expect(activeAt("/projects/notice")).toBe("applicant-notice")
    expect(activeAt("/projects/apply/12")).toBe("applicant-guide")
    expect(activeAt("/projects/application")).toBe("applicant-application")
    expect(activeAt("/projects/application/list")).toBe("applicant-application")
  })

  it("지원 방법은 안내 페이지로 이동한다", () => {
    const guide = APPLICANT_SIDEBAR_ITEMS.find(
      (i) => i.id === "applicant-guide",
    )
    expect(guide?.disabled).toBeFalsy()
    expect(guide?.to).toBe("/projects/apply-guide")
  })

  it("항목 순서는 디자인대로 셋이다", () => {
    expect(APPLICANT_SIDEBAR_ITEMS.map((i) => i.title)).toEqual([
      "지원 방법",
      "모집 공고",
      "내 지원서",
    ])
  })
})
