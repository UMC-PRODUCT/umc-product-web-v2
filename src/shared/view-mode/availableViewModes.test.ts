import { describe, expect, it } from "vitest"

import {
  computeAvailableViewModes,
  resolveAvailableViewMode,
} from "./availableViewModes"

import type { MemberInfoResponse } from "@/features/auth/api/me"

function makeMe(
  roleTypes: string[],
  parts: string[],
  currentIndex: number | null = parts.length > 0 ? 0 : null,
): MemberInfoResponse {
  return {
    roles: roleTypes.map((roleType) => ({ roleType })),
    challengerRecords: parts.map((part, i) => ({
      challengerId: String(i),
      gisuId: String(10 - i),
      part,
    })),
    currentGisuMemberInfo:
      currentIndex === null
        ? null
        : {
            gisuId: String(10 - currentIndex),
            generation: String(10 - currentIndex),
            challenger: {
              challengerId: String(currentIndex),
              part: parts[currentIndex],
              challengerStatus: "ACTIVE",
            },
            isAdmin: roleTypes.length > 0,
            roleTypes,
          },
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

  it("학교 파트장 + PLAN 챌린저 → [admin, pm]", () => {
    const me = makeMe(["SCHOOL_PART_LEADER"], ["PLAN"])
    expect(computeAvailableViewModes(me)).toEqual(["admin", "pm"])
  })

  it("현재 PLAN + 과거 비-PLAN 챌린저 → [pm]", () => {
    const me = makeMe([], ["PLAN", "WEB"])
    expect(computeAvailableViewModes(me)).toEqual(["pm"])
  })

  it("비-PLAN 챌린저만 → [others]", () => {
    const me = makeMe([], ["WEB"])
    expect(computeAvailableViewModes(me)).toEqual(["others"])
  })

  it("학교 운영진 단일 → [admin]", () => {
    const me = makeMe(["SCHOOL_PRESIDENT"], [])
    expect(computeAvailableViewModes(me)).toEqual(["admin"])
  })

  it("운영진 + 현재 ADMIN record → [admin]", () => {
    const me = makeMe(["SUPER_ADMIN"], ["ADMIN"])
    expect(computeAvailableViewModes(me)).toEqual(["admin"])
  })

  it("현재 기수 challenger가 null이고 역할만 있으면 admin만 제공", () => {
    const me = {
      ...makeMe(["SCHOOL_PART_LEADER"], []),
      currentGisuMemberInfo: {
        gisuId: "10",
        generation: "10",
        challenger: null,
        isAdmin: true,
        roleTypes: ["SCHOOL_PART_LEADER"],
      },
    } as unknown as MemberInfoResponse

    expect(computeAvailableViewModes(me)).toEqual(["admin"])
  })

  it("운영진 + 과거 비-PLAN 챌린저 → [admin]", () => {
    const me = makeMe(["CENTRAL_OPERATING_TEAM_MEMBER"], ["WEB"], null)
    expect(computeAvailableViewModes(me)).toEqual(["admin"])
  })

  it("me undefined → []", () => {
    expect(computeAvailableViewModes(undefined)).toEqual([])
  })
})

describe("resolveAvailableViewMode", () => {
  it("현재 mode가 사용 가능하면 그대로 유지한다", () => {
    expect(resolveAvailableViewMode("pm", ["admin", "pm"])).toBe("pm")
  })

  it("현재 mode가 사용 불가능하면 첫 사용 가능 mode로 보정한다", () => {
    expect(resolveAvailableViewMode("others", ["admin", "pm"])).toBe("admin")
  })

  it("사용 가능 mode가 비어 있으면 현재 mode를 유지한다", () => {
    expect(resolveAvailableViewMode("admin", [])).toBe("admin")
  })
})
