import { describe, expect, it } from "vitest"

import {
  isRecruitingStaffRole,
  RECRUITMENT_BOX_ID,
  resolveDropTargetId,
  SCHOOL_STAFF_PANEL_ID,
  type Staff,
} from "./evaluatorAllocation"

describe("resolveDropTargetId", () => {
  const sampleAssigned: Staff[] = [
    { id: "staff-1", nickname: "이삭", name: "강지훈" },
  ]

  it("returns RECRUITMENT_BOX_ID when overId is recruitment box or assigned staff chip", () => {
    expect(resolveDropTargetId(RECRUITMENT_BOX_ID, sampleAssigned)).toBe(
      RECRUITMENT_BOX_ID,
    )
    expect(resolveDropTargetId("assigned-staff-staff-1", sampleAssigned)).toBe(
      RECRUITMENT_BOX_ID,
    )
    expect(resolveDropTargetId("staff-1", sampleAssigned)).toBe(
      RECRUITMENT_BOX_ID,
    )
  })

  it("returns SCHOOL_STAFF_PANEL_ID when overId is staff panel or unassigned staff chip", () => {
    expect(resolveDropTargetId(SCHOOL_STAFF_PANEL_ID, [])).toBe(
      SCHOOL_STAFF_PANEL_ID,
    )
    expect(resolveDropTargetId("staff-2", [])).toBe(SCHOOL_STAFF_PANEL_ID)
  })

  it("returns null for unknown drop target", () => {
    expect(resolveDropTargetId("unknown-target", [])).toBeNull()
  })
})

// 한 학교에 챌린저가 수백 명이라, 거르지 않으면 명단에서 운영진을 찾을 수 없다
describe("isRecruitingStaffRole", () => {
  it("운영진 역할이 있으면 true", () => {
    expect(isRecruitingStaffRole(["SCHOOL_PRESIDENT"])).toBe(true)
    expect(isRecruitingStaffRole(["SCHOOL_PART_LEADER"])).toBe(true)
    expect(isRecruitingStaffRole(["SCHOOL_ETC_ADMIN"])).toBe(true)
    expect(isRecruitingStaffRole(["CHAPTER_PRESIDENT"])).toBe(true)
  })

  // 서버는 운영진 기록이 없는 사람에게 역할을 비워서 준다
  it("역할이 없으면 false", () => {
    expect(isRecruitingStaffRole([])).toBe(false)
    expect(isRecruitingStaffRole(undefined)).toBe(false)
  })

  it("챌린저만 있으면 false", () => {
    expect(isRecruitingStaffRole(["CHALLENGER"])).toBe(false)
  })

  it("챌린저와 운영진이 섞여 있으면 true", () => {
    expect(isRecruitingStaffRole(["CHALLENGER", "SCHOOL_PART_LEADER"])).toBe(
      true,
    )
  })
})
