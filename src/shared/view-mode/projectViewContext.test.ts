import { describe, expect, it } from "vitest"

import { getProjectViewContext } from "./projectViewContext"

import type { MemberInfoResponse } from "@/features/auth/api/me"

const baseMe = {
  id: 1,
  name: "홍길동",
  nickname: "길동",
  email: "a@b.com",
  schoolId: 1,
  schoolName: "UMC",
  profileImageLink: "",
  status: "ACTIVE",
  roles: [{ roleType: "SCHOOL_PART_LEADER" }],
  currentGisuMemberInfo: {
    gisuId: "10",
    generation: "10",
    challenger: {
      challengerId: "1",
      part: "PLAN",
      challengerStatus: "ACTIVE",
    },
    isAdmin: true,
    roleTypes: ["SCHOOL_PART_LEADER"],
  },
  challengerRecords: [
    { challengerId: "1", gisuId: "10", part: "PLAN", chapterId: "7" },
    { challengerId: "2", gisuId: "9", part: "WEB", chapterId: "6" },
  ],
} as unknown as MemberInfoResponse

describe("getProjectViewContext", () => {
  it("admin view는 원본 권한을 보존하면서 admin 관점만 표시한다", () => {
    const context = getProjectViewContext(baseMe, "admin")
    expect(context.isAdminView).toBe(true)
    expect(context.isPmView).toBe(false)
    expect(context.currentPart).toBe("PLAN")
  })

  it("pm view는 현재 기수 PLAN 기록으로 표시 컨텍스트를 만든다", () => {
    const context = getProjectViewContext(baseMe, "pm")
    expect(context.isAdminView).toBe(false)
    expect(context.isPmView).toBe(true)
    expect(context.currentGisuId).toBe("10")
    expect(context.currentChapterId).toBe("7")
  })

  it("others view는 현재 기수 비PLAN 기록이 없으면 challenger 관점으로 열리지 않는다", () => {
    const context = getProjectViewContext(baseMe, "others")
    expect(context.isChallengerView).toBe(false)
  })

  it("현재 기수 비PLAN 기록이 있으면 challenger 관점을 제공한다", () => {
    const me = {
      ...baseMe,
      currentGisuMemberInfo: {
        ...baseMe.currentGisuMemberInfo,
        challenger: {
          challengerId: "3",
          part: "SPRINGBOOT",
          challengerStatus: "ACTIVE",
        },
      },
      challengerRecords: [
        { challengerId: "3", gisuId: "10", part: "SPRINGBOOT" },
      ],
    } as unknown as MemberInfoResponse

    const context = getProjectViewContext(me, "others")
    expect(context.isChallengerView).toBe(true)
    expect(context.currentPart).toBe("SPRINGBOOT")
  })
})
