import { describe, expect, it } from "vitest"

import { buildProjectCapabilities } from "./projectCapabilities"

import type { MemberInfoResponse } from "@/features/auth/api/me"
import type { Part, RoleType } from "@/features/challenger/model/types"

function makeMe(roleTypes: RoleType[], part?: Part): MemberInfoResponse {
  return {
    id: "1",
    name: "김준호",
    nickname: "나르",
    email: "a@b.com",
    schoolId: "1",
    schoolName: "한성대학교",
    profileImageLink: null,
    status: "ACTIVE",
    hasLocalCredential: true,
    roles: roleTypes.map((roleType) => ({
      roleType,
      challengerRoleId: "",
      challengerId: "1",
      organizationType: "SCHOOL",
      organizationId: "1",
      gisuId: "10",
      gisu: "10",
    })),
    currentGisuMemberInfo: part
      ? {
          gisuId: "10",
          generation: "10",
          challenger: {
            challengerId: "1",
            part,
            challengerStatus: "ACTIVE",
          },
          isAdmin: roleTypes.length > 0,
          roleTypes,
        }
      : null,
    challengerRecords: part
      ? [
          {
            challengerId: "1",
            memberId: "1",
            gisuId: "10",
            gisu: "10",
            chapterId: "1",
            chapterName: "Chromium",
            part,
            challengerStatus: "ACTIVE",
            name: "김준호",
            nickname: "나르",
            email: null,
            schoolId: "1",
            schoolName: "한성대학교",
          },
        ]
      : [],
  }
}

describe("buildProjectCapabilities", () => {
  it("서버 PROJECT WRITE 권한이 true면 학교 파트장도 프로젝트 등록 가능으로 본다", () => {
    const capabilities = buildProjectCapabilities({
      me: makeMe(["SCHOOL_PART_LEADER"], "PLAN"),
      hasProjectWritePermission: true,
    })

    expect(capabilities.canWriteProject).toBe(true)
    expect(capabilities.canAccessProjectSettings).toBe(true)
  })

  it("서버 PROJECT WRITE 권한이 false면 PLAN이 아니어도 프론트 heuristic으로 등록을 열지 않는다", () => {
    const capabilities = buildProjectCapabilities({
      me: makeMe(["SCHOOL_PART_LEADER"], "SPRINGBOOT"),
      hasProjectWritePermission: false,
    })

    expect(capabilities.canWriteProject).toBe(false)
  })

  it("학교 회장단은 프로젝트 관리 접근을 유지한다", () => {
    const capabilities = buildProjectCapabilities({
      me: makeMe(["SCHOOL_PRESIDENT"], "SPRINGBOOT"),
      hasProjectWritePermission: true,
    })

    expect(capabilities.canAccessProjectManagement).toBe(true)
    expect(capabilities.canWriteProject).toBe(true)
  })

  it("휴지기 사용자에게는 프로젝트 capability를 열지 않는다", () => {
    const capabilities = buildProjectCapabilities({
      me: undefined,
      hasProjectWritePermission: true,
    })

    expect(capabilities.canWriteProject).toBe(false)
    expect(capabilities.canAccessProjectSettings).toBe(false)
  })
})
