import { describe, expect, it } from "vitest"

import { canViewDefaultNotice } from "./defaultNotices"

import type { MemberInfoResponse } from "@/features/auth/api/me"
import type {
  ChallengerInfoResponse,
  ChallengerRoleResponse,
  Part,
  RoleType,
} from "@/features/challenger/model/types"

function makeMe({
  part,
  roleTypes = ["CHALLENGER"],
  isAdmin = roleTypes.some((roleType) => roleType !== "CHALLENGER"),
}: {
  part?: Part
  roleTypes?: RoleType[]
  isAdmin?: boolean
} = {}): MemberInfoResponse {
  const roles: ChallengerRoleResponse[] = roleTypes.map((roleType) => ({
    challengerRoleId: "0",
    challengerId: "0",
    roleType,
    organizationType: "CHAPTER",
    organizationId: "0",
    gisuId: "10",
    gisu: "10",
  }))

  const challengerRecords: ChallengerInfoResponse[] = part
    ? [
        {
          challengerId: "0",
          memberId: "0",
          gisuId: "10",
          gisu: "10",
          chapterId: "0",
          chapterName: "테스트 지부",
          part,
          challengerStatus: "ACTIVE",
          name: "테스트",
          nickname: "테스트",
          email: null,
          schoolId: "0",
          schoolName: "테스트 학교",
        },
      ]
    : []

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
    currentGisuMemberInfo: {
      gisuId: "10",
      generation: "10",
      challenger: part
        ? {
            challengerId: "0",
            part,
            challengerStatus: "ACTIVE",
          }
        : null,
      isAdmin,
      roleTypes,
    },
    roles,
    challengerRecords,
  }
}

describe("canViewDefaultNotice", () => {
  it("all은 모든 사용자가 볼 수 있다", () => {
    expect(canViewDefaultNotice("all", makeMe({ part: "WEB" }))).toBe(true)
  })

  it("pm은 일반 챌린저를 제외한다", () => {
    expect(canViewDefaultNotice("pm", makeMe({ part: "WEB" }))).toBe(false)
  })

  it("pm은 플랜 챌린저가 볼 수 있다", () => {
    expect(canViewDefaultNotice("pm", makeMe({ part: "PLAN" }))).toBe(true)
  })

  it("operator는 플랜 챌린저를 제외한다", () => {
    expect(canViewDefaultNotice("operator", makeMe({ part: "PLAN" }))).toBe(
      false,
    )
  })

  it("operator는 운영진이 볼 수 있다", () => {
    expect(
      canViewDefaultNotice(
        "operator",
        makeMe({ roleTypes: ["CHAPTER_PRESIDENT"] }),
      ),
    ).toBe(true)
  })

  it("일반 챌린저라도 ADMIN 파트면 pm과 operator를 볼 수 있다", () => {
    const me = makeMe({ part: "ADMIN", isAdmin: false })

    expect(canViewDefaultNotice("pm", me)).toBe(true)
    expect(canViewDefaultNotice("operator", me)).toBe(true)
  })
})
