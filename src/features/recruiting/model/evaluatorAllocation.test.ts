import { describe, expect, it } from "vitest"

import {
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
