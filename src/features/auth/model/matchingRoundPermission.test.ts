import { describe, expect, it } from "vitest"

import { canManageMatchingRounds } from "./identity"

import type { MemberInfoResponse } from "@/features/auth/api/me"
import type {
  ChallengerInfoResponse,
  ChallengerRoleResponse,
  Part,
  RoleType,
} from "@/features/challenger/model/types"

function makeMe(
  roleTypes: RoleType[],
  records: Array<{ gisuId: string; part: Part }> = [],
): MemberInfoResponse {
  const roles: ChallengerRoleResponse[] = roleTypes.map((roleType) => ({
    challengerRoleId: "0",
    challengerId: "0",
    roleType,
    organizationType: "CENTRAL",
    organizationId: "0",
    gisuId: "10",
    gisu: "10",
  }))

  const challengerRecords: ChallengerInfoResponse[] = records.map((record) => ({
    challengerId: "0",
    memberId: "0",
    gisuId: record.gisuId,
    gisu: record.gisuId,
    chapterId: "0",
    chapterName: "테스트 지부",
    part: record.part,
    challengerStatus: "ACTIVE",
    name: "테스트",
    nickname: "테스트",
    email: null,
    schoolId: "0",
    schoolName: "테스트 학교",
  }))

  return {
    id: "0",
    name: "테스트",
    nickname: "테스트",
    email: "test@test.com",
    schoolId: "0",
    schoolName: "테스트 학교",
    profileImageLink: null,
    status: "ACTIVE",
    hasLocalCredential: false,
    roles,
    challengerRecords,
  }
}

describe("canManageMatchingRounds", () => {
  it("슈퍼 관리자·중앙 총괄단·지부장은 true", () => {
    expect(canManageMatchingRounds(makeMe(["SUPER_ADMIN"]))).toBe(true)
    expect(canManageMatchingRounds(makeMe(["CENTRAL_PRESIDENT"]))).toBe(true)
    expect(canManageMatchingRounds(makeMe(["CENTRAL_VICE_PRESIDENT"]))).toBe(
      true,
    )
    expect(canManageMatchingRounds(makeMe(["CHAPTER_PRESIDENT"]))).toBe(true)
  })

  it("중앙 팀원·학교 운영진·PM·일반 챌린저는 false", () => {
    expect(
      canManageMatchingRounds(makeMe(["CENTRAL_OPERATING_TEAM_MEMBER"])),
    ).toBe(false)
    expect(
      canManageMatchingRounds(makeMe(["CENTRAL_EDUCATION_TEAM_MEMBER"])),
    ).toBe(false)
    expect(canManageMatchingRounds(makeMe(["SCHOOL_PRESIDENT"]))).toBe(false)
    expect(canManageMatchingRounds(makeMe(["SCHOOL_PART_LEADER"]))).toBe(false)
    expect(
      canManageMatchingRounds(
        makeMe(["CHALLENGER"], [{ gisuId: "10", part: "PLAN" }]),
      ),
    ).toBe(false)
    expect(
      canManageMatchingRounds(
        makeMe(["CHALLENGER"], [{ gisuId: "10", part: "WEB" }]),
      ),
    ).toBe(false)
  })

  it("유저 정보가 없거나(undefined) 역할이 없는 경우 false", () => {
    expect(canManageMatchingRounds(undefined)).toBe(false)
    expect(canManageMatchingRounds(makeMe([]))).toBe(false)
  })
})
