import { describe, expect, it } from "vitest"

import { computeAvailableViewModes } from "./availableViewModes"

import type { MemberInfoResponse } from "@/features/auth/api/me"

function makeMe(roleTypes: string[], parts: string[]): MemberInfoResponse {
  return {
    roles: roleTypes.map((roleType) => ({ roleType })),
    challengerRecords: parts.map((part, i) => ({
      challengerId: String(i),
      gisuId: String(10 - i),
      part,
    })),
  } as unknown as MemberInfoResponse
}

describe("computeAvailableViewModes", () => {
  it("운영진 + 비-PLAN 챌린저 → [admin, others]", () => {
    const me = makeMe(["CENTRAL_OPERATING_TEAM_MEMBER"], ["WEB"])
    expect(computeAvailableViewModes(me)).toEqual(["admin", "others"])
  })

  it("운영진 + PLAN 챌린저 → [admin, pm]", () => {
    const me = makeMe(["CHAPTER_PRESIDENT"], ["PLAN"])
    expect(computeAvailableViewModes(me)).toEqual(["admin", "pm"])
  })

  it("PLAN + 비-PLAN만 → [pm, others]", () => {
    const me = makeMe([], ["PLAN", "WEB"])
    expect(computeAvailableViewModes(me)).toEqual(["pm", "others"])
  })

  it("비-PLAN 챌린저만 → [others]", () => {
    const me = makeMe([], ["WEB"])
    expect(computeAvailableViewModes(me)).toEqual(["others"])
  })

  it("학교 운영진 단일 → [admin]", () => {
    const me = makeMe(["SCHOOL_PRESIDENT"], [])
    expect(computeAvailableViewModes(me)).toEqual(["admin"])
  })

  it("me undefined → []", () => {
    expect(computeAvailableViewModes(undefined)).toEqual([])
  })
})
