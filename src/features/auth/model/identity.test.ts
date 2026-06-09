import { describe, expect, it } from "vitest"

import {
  canAccessProjectSettings,
  canManageProjects,
  isAnyOperator,
  isSchoolLeadership,
} from "./identity"

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

  const challengerRecords: ChallengerInfoResponse[] = records.map((r) => ({
    challengerId: "0",
    memberId: "0",
    gisuId: r.gisuId,
    gisu: r.gisuId,
    chapterId: "0",
    chapterName: "테스트 지부",
    part: r.part,
    challengerStatus: "ACTIVE",
    name: "테스트",
    nickname: "테스트",
    email: null,
    schoolId: "0",
    schoolName: "테스트 학교",
  }))

  return {
    id: 0,
    name: "테스트",
    nickname: "테스트",
    email: "test@test.com",
    schoolId: 0,
    schoolName: "테스트 학교",
    profileImageLink: "",
    status: "ACTIVE",
    roles,
    challengerRecords,
  }
}

describe("isSchoolLeadership", () => {
  it("학교 회장·부회장은 true", () => {
    expect(isSchoolLeadership(makeMe(["SCHOOL_PRESIDENT"]))).toBe(true)
    expect(isSchoolLeadership(makeMe(["SCHOOL_VICE_PRESIDENT"]))).toBe(true)
  })
  it("학교 파트장·기타운영진은 false", () => {
    expect(isSchoolLeadership(makeMe(["SCHOOL_PART_LEADER"]))).toBe(false)
    expect(isSchoolLeadership(makeMe(["SCHOOL_ETC_ADMIN"]))).toBe(false)
  })
  it("undefined는 false", () => {
    expect(isSchoolLeadership(undefined)).toBe(false)
  })
})

describe("isAnyOperator", () => {
  it("중앙/지부/학교 4종 모두 true", () => {
    expect(isAnyOperator(makeMe(["SUPER_ADMIN"]))).toBe(true)
    expect(isAnyOperator(makeMe(["CENTRAL_OPERATING_TEAM_MEMBER"]))).toBe(true)
    expect(isAnyOperator(makeMe(["CHAPTER_PRESIDENT"]))).toBe(true)
    expect(isAnyOperator(makeMe(["SCHOOL_PART_LEADER"]))).toBe(true)
    expect(isAnyOperator(makeMe(["SCHOOL_ETC_ADMIN"]))).toBe(true)
  })
  it("일반 챌린저는 false", () => {
    expect(isAnyOperator(makeMe(["CHALLENGER"]))).toBe(false)
  })
})

describe("canAccessProjectSettings", () => {
  it("학교 기타운영진은 true(그룹 노출)", () => {
    expect(canAccessProjectSettings(makeMe(["SCHOOL_ETC_ADMIN"]))).toBe(true)
  })
  it("현기수 PM(최신 기수 PLAN)은 true", () => {
    expect(
      canAccessProjectSettings(
        makeMe(["CHALLENGER"], [{ gisuId: "10", part: "PLAN" }]),
      ),
    ).toBe(true)
  })
  it("비PM 일반 챌린저는 false", () => {
    expect(
      canAccessProjectSettings(
        makeMe(["CHALLENGER"], [{ gisuId: "10", part: "IOS" }]),
      ),
    ).toBe(false)
  })
})

describe("canManageProjects", () => {
  it("학교 회장단·중앙·지부장은 true", () => {
    expect(canManageProjects(makeMe(["SCHOOL_VICE_PRESIDENT"]))).toBe(true)
    expect(canManageProjects(makeMe(["CHAPTER_PRESIDENT"]))).toBe(true)
    expect(canManageProjects(makeMe(["CENTRAL_PRESIDENT"]))).toBe(true)
  })
  it("학교 파트장·기타운영진은 false(등록·관리 제외)", () => {
    expect(canManageProjects(makeMe(["SCHOOL_PART_LEADER"]))).toBe(false)
    expect(canManageProjects(makeMe(["SCHOOL_ETC_ADMIN"]))).toBe(false)
  })
  it("현기수 PM은 true, 비PM 챌린저는 false", () => {
    expect(
      canManageProjects(
        makeMe(["CHALLENGER"], [{ gisuId: "10", part: "PLAN" }]),
      ),
    ).toBe(true)
    expect(
      canManageProjects(
        makeMe(["CHALLENGER"], [{ gisuId: "10", part: "NODEJS" }]),
      ),
    ).toBe(false)
  })
})
