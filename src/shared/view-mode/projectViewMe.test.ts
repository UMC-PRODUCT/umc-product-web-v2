import { describe, expect, it } from "vitest"

import { projectViewMe } from "./projectViewMe"

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
  roles: [{ roleType: "CENTRAL_OPERATING_TEAM_MEMBER" }],
  currentGisuMemberInfo: {
    gisuId: "10",
    generation: "10",
    challenger: {
      challengerId: "1",
      part: "PLAN",
      challengerStatus: "ACTIVE",
    },
    isAdmin: true,
    roleTypes: ["CENTRAL_OPERATING_TEAM_MEMBER"],
  },
  challengerRecords: [
    { challengerId: "1", gisuId: "10", part: "PLAN" },
    { challengerId: "2", gisuId: "9", part: "WEB" },
  ],
} as unknown as MemberInfoResponse

describe("projectViewMe", () => {
  it("admin: challengerRecords를 비운다", () => {
    const v = projectViewMe(baseMe, "admin")
    expect(v?.roles).toHaveLength(1)
    expect(v?.challengerRecords).toEqual([])
  })

  it("pm: roles를 비우고 PLAN 기록만 남긴다", () => {
    const v = projectViewMe(baseMe, "pm")
    expect(v?.roles).toEqual([])
    expect(v?.challengerRecords?.map((r) => r.part)).toEqual(["PLAN"])
  })

  it("others: roles를 비우고 비-PLAN 기록만 남긴다", () => {
    const me = {
      ...baseMe,
      currentGisuMemberInfo: {
        gisuId: "9",
        generation: "9",
        challenger: {
          challengerId: "2",
          part: "WEB",
          challengerStatus: "ACTIVE",
        },
        isAdmin: true,
        roleTypes: ["CENTRAL_OPERATING_TEAM_MEMBER"],
      },
    } as unknown as MemberInfoResponse
    const v = projectViewMe(me, "others")
    expect(v?.roles).toEqual([])
    expect(v?.challengerRecords?.map((r) => r.part)).toEqual(["WEB"])
  })

  it("현재 기수가 아닌 기록은 viewMe에서 제외한다", () => {
    const v = projectViewMe(baseMe, "others")
    expect(v?.roles).toEqual([])
    expect(v?.challengerRecords).toEqual([])
  })

  it("me가 undefined면 undefined 반환", () => {
    expect(projectViewMe(undefined, "admin")).toBeUndefined()
  })
})
