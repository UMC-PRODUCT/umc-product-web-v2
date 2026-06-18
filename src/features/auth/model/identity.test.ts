import { describe, expect, it } from "vitest"

import {
  canAccessProjectSettings,
  canManageProjectRecruitInfo,
  canManageProjects,
  getCurrentChallengerPart,
  getProjectPmSearchScope,
  isAnyOperator,
  isCentralCore,
  isCurrentTermPm,
  isProjectRegistrationQuotaLimited,
  isSchoolLeadership,
} from "./identity"

import type { MemberInfoResponse } from "@/features/auth/api/me"
import type {
  ChallengerInfoResponse,
  ChallengerRoleResponse,
  Part,
  RoleType,
} from "@/features/challenger/model/types"

type RoleSpec = RoleType | { roleType: RoleType; organizationId: string }

function makeMe(
  roleSpecs: RoleSpec[],
  records: Array<{ gisuId: string; part: Part }> = [],
  overrides: Partial<MemberInfoResponse> = {},
): MemberInfoResponse {
  const roles: ChallengerRoleResponse[] = roleSpecs.map((spec) => {
    const roleType = typeof spec === "string" ? spec : spec.roleType
    const organizationId = typeof spec === "string" ? "0" : spec.organizationId
    return {
      challengerRoleId: "0",
      challengerId: "0",
      roleType,
      organizationType: "CENTRAL",
      organizationId,
      gisuId: "10",
      gisu: "10",
    }
  })

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
  const currentRecord = challengerRecords.reduce<ChallengerInfoResponse | null>(
    (latest, record) =>
      latest == null || Number(record.gisuId) > Number(latest.gisuId)
        ? record
        : latest,
    null,
  )
  const roleTypes = roleSpecs.map((spec) =>
    typeof spec === "string" ? spec : spec.roleType,
  )

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
    currentGisuMemberInfo: currentRecord
      ? {
          gisuId: currentRecord.gisuId,
          generation: currentRecord.gisu,
          challenger: {
            challengerId: currentRecord.challengerId,
            part: currentRecord.part,
            challengerStatus: currentRecord.challengerStatus,
          },
          isAdmin: roles.length > 0,
          roleTypes,
        }
      : null,
    roles,
    challengerRecords,
    ...overrides,
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

describe("isCentralCore", () => {
  it("슈퍼어드민·총괄·부총괄은 true", () => {
    expect(isCentralCore(makeMe(["SUPER_ADMIN"]))).toBe(true)
    expect(isCentralCore(makeMe(["CENTRAL_PRESIDENT"]))).toBe(true)
    expect(isCentralCore(makeMe(["CENTRAL_VICE_PRESIDENT"]))).toBe(true)
  })

  it("중앙 운영국원·교육국원은 false", () => {
    expect(isCentralCore(makeMe(["CENTRAL_OPERATING_TEAM_MEMBER"]))).toBe(false)
    expect(isCentralCore(makeMe(["CENTRAL_EDUCATION_TEAM_MEMBER"]))).toBe(false)
  })
})

describe("isCurrentTermPm", () => {
  it("현재 활성 기수 challenger가 PLAN이면 true", () => {
    expect(
      isCurrentTermPm(makeMe(["CHALLENGER"], [{ gisuId: "10", part: "PLAN" }])),
    ).toBe(true)
  })

  it("과거 PLAN 이력이 있어도 현재 활성 기수 challenger가 비PLAN이면 false", () => {
    expect(
      isCurrentTermPm(
        makeMe(
          ["CHALLENGER"],
          [
            { gisuId: "9", part: "PLAN" },
            { gisuId: "10", part: "IOS" },
          ],
        ),
      ),
    ).toBe(false)
  })

  it("currentGisuMemberInfo가 null이면 과거 PLAN 이력이 있어도 false", () => {
    expect(
      isCurrentTermPm(
        makeMe(["CHALLENGER"], [{ gisuId: "10", part: "PLAN" }], {
          currentGisuMemberInfo: null,
        }),
      ),
    ).toBe(false)
  })

  it("현재 활성 기수 challenger가 null이면 role만 있어도 false", () => {
    expect(
      isCurrentTermPm(
        makeMe(["SCHOOL_PART_LEADER"], [{ gisuId: "10", part: "PLAN" }], {
          currentGisuMemberInfo: {
            gisuId: "10",
            generation: "10",
            challenger: null,
            isAdmin: true,
            roleTypes: ["SCHOOL_PART_LEADER"],
          },
        }),
      ),
    ).toBe(false)
  })
})

describe("getCurrentChallengerPart", () => {
  it("currentGisuMemberInfo의 challenger part를 우선한다", () => {
    const me = makeMe(
      ["CHAPTER_PRESIDENT"],
      [
        { gisuId: "9", part: "WEB" },
        { gisuId: "10", part: "SPRINGBOOT" },
      ],
    )

    expect(getCurrentChallengerPart(me)).toBe("SPRINGBOOT")
  })

  it("currentGisuMemberInfo가 없으면 최신 기록이 있어도 undefined를 반환한다", () => {
    const me = makeMe(
      ["CHALLENGER"],
      [
        { gisuId: "9", part: "WEB" },
        { gisuId: "10", part: "IOS" },
      ],
      { currentGisuMemberInfo: null },
    )

    expect(getCurrentChallengerPart(me)).toBeUndefined()
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
  it("최신 기수의 part가 PLAN이 아니면 false (이전 기수 PLAN 무시)", () => {
    expect(
      canAccessProjectSettings(
        makeMe(
          ["CHALLENGER"],
          [
            { gisuId: "9", part: "PLAN" },
            { gisuId: "10", part: "IOS" },
          ],
        ),
      ),
    ).toBe(false)
  })
  it("이전 기수가 비PLAN이어도 최신 기수가 PLAN이면 true", () => {
    expect(
      canAccessProjectSettings(
        makeMe(
          ["CHALLENGER"],
          [
            { gisuId: "9", part: "IOS" },
            { gisuId: "10", part: "PLAN" },
          ],
        ),
      ),
    ).toBe(true)
  })
})

describe("canManageProjects", () => {
  it("학교 회장단·중앙·지부장은 true", () => {
    expect(canManageProjects(makeMe(["SCHOOL_VICE_PRESIDENT"]))).toBe(true)
    expect(canManageProjects(makeMe(["CHAPTER_PRESIDENT"]))).toBe(true)
    expect(canManageProjects(makeMe(["CENTRAL_PRESIDENT"]))).toBe(true)
    expect(canManageProjects(makeMe(["SUPER_ADMIN"]))).toBe(true)
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

describe("canManageProjectRecruitInfo", () => {
  it("슈퍼어드민·중앙 총괄단·지부장은 true", () => {
    expect(canManageProjectRecruitInfo(makeMe(["SUPER_ADMIN"]))).toBe(true)
    expect(canManageProjectRecruitInfo(makeMe(["CENTRAL_PRESIDENT"]))).toBe(
      true,
    )
    expect(
      canManageProjectRecruitInfo(makeMe(["CENTRAL_VICE_PRESIDENT"])),
    ).toBe(true)
    expect(canManageProjectRecruitInfo(makeMe(["CHAPTER_PRESIDENT"]))).toBe(
      true,
    )
  })

  it("중앙 일반 운영진·학교 회장단·PM은 false", () => {
    expect(
      canManageProjectRecruitInfo(makeMe(["CENTRAL_OPERATING_TEAM_MEMBER"])),
    ).toBe(false)
    expect(canManageProjectRecruitInfo(makeMe(["SCHOOL_PRESIDENT"]))).toBe(
      false,
    )
    expect(canManageProjectRecruitInfo(makeMe(["SCHOOL_VICE_PRESIDENT"]))).toBe(
      false,
    )
    expect(
      canManageProjectRecruitInfo(
        makeMe(["CHALLENGER"], [{ gisuId: "10", part: "PLAN" }]),
      ),
    ).toBe(false)
  })
})

describe("getProjectPmSearchScope", () => {
  it("SUPER_ADMIN은 빈 객체 반환", () => {
    expect(getProjectPmSearchScope(makeMe(["SUPER_ADMIN"]))).toEqual({})
  })

  it("중앙 운영진(CENTRAL_PRESIDENT)은 빈 객체 반환", () => {
    expect(getProjectPmSearchScope(makeMe(["CENTRAL_PRESIDENT"]))).toEqual({})
  })

  it("CHAPTER_PRESIDENT는 해당 역할의 organizationId를 chapterId로 반환", () => {
    expect(
      getProjectPmSearchScope(
        makeMe([{ roleType: "CHAPTER_PRESIDENT", organizationId: "77" }]),
      ),
    ).toEqual({ chapterId: "77" })
  })

  it("SCHOOL_PRESIDENT는 schoolId를 문자열로 반환", () => {
    expect(
      getProjectPmSearchScope(
        makeMe(["SCHOOL_PRESIDENT"], [], { schoolId: "12" }),
      ),
    ).toEqual({ schoolId: "12" })
  })

  it("SCHOOL_VICE_PRESIDENT도 schoolId를 문자열로 반환", () => {
    expect(
      getProjectPmSearchScope(
        makeMe(["SCHOOL_VICE_PRESIDENT"], [], { schoolId: "5" }),
      ),
    ).toEqual({ schoolId: "5" })
  })

  it("순수 PM(현기수 PLAN, 운영 역할 없음)은 본인 지부 scope를 반환", () => {
    expect(
      getProjectPmSearchScope(
        makeMe(["CHALLENGER"], [{ gisuId: "10", part: "PLAN" }]),
      ),
    ).toEqual({ chapterId: "0" })
  })

  it("undefined는 빈 객체 반환", () => {
    expect(getProjectPmSearchScope(undefined)).toEqual({})
  })
})

describe("isProjectRegistrationQuotaLimited", () => {
  it("순수 PM(현기수 PLAN, 운영 역할 없음)은 1개 제한 대상 true", () => {
    expect(
      isProjectRegistrationQuotaLimited(
        makeMe(["CHALLENGER"], [{ gisuId: "10", part: "PLAN" }]),
      ),
    ).toBe(true)
  })
  it("Plan + 지부장은 운영 권한 우선으로 제한 제외 false", () => {
    expect(
      isProjectRegistrationQuotaLimited(
        makeMe(["CHAPTER_PRESIDENT"], [{ gisuId: "10", part: "PLAN" }]),
      ),
    ).toBe(false)
  })
  it("Plan + 최고관리자도 제한 제외 false", () => {
    expect(
      isProjectRegistrationQuotaLimited(
        makeMe(["SUPER_ADMIN"], [{ gisuId: "10", part: "PLAN" }]),
      ),
    ).toBe(false)
  })
  it("Plan + 학교 회장도 제한 제외 false", () => {
    expect(
      isProjectRegistrationQuotaLimited(
        makeMe(["SCHOOL_PRESIDENT"], [{ gisuId: "10", part: "PLAN" }]),
      ),
    ).toBe(false)
  })
  it("Plan + 학교 기타운영진도 제한 제외 false", () => {
    expect(
      isProjectRegistrationQuotaLimited(
        makeMe(["SCHOOL_ETC_ADMIN"], [{ gisuId: "10", part: "PLAN" }]),
      ),
    ).toBe(false)
  })
  it("운영진이지만 현기수 비PM(비PLAN)이면 false", () => {
    expect(
      isProjectRegistrationQuotaLimited(
        makeMe(["SUPER_ADMIN"], [{ gisuId: "10", part: "IOS" }]),
      ),
    ).toBe(false)
  })
  it("비PM 일반 챌린저는 false", () => {
    expect(
      isProjectRegistrationQuotaLimited(
        makeMe(["CHALLENGER"], [{ gisuId: "10", part: "IOS" }]),
      ),
    ).toBe(false)
  })
  it("최신 기수가 PLAN이 아니면(이전 기수 PLAN 무시) false", () => {
    expect(
      isProjectRegistrationQuotaLimited(
        makeMe(
          ["CHALLENGER"],
          [
            { gisuId: "9", part: "PLAN" },
            { gisuId: "10", part: "IOS" },
          ],
        ),
      ),
    ).toBe(false)
  })
  it("undefined는 false", () => {
    expect(isProjectRegistrationQuotaLimited(undefined)).toBe(false)
  })
})
