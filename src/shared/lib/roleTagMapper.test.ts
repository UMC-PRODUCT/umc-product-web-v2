import { describe, expect, it } from "vitest"

import { toRoleTag } from "./roleTagMapper"

import type { RoleTag, RoleType } from "@/shared/model/domain"

const roleMappings: Array<[RoleType, RoleTag]> = [
  ["CHALLENGER", "challenger"],
  ["SUPER_ADMIN", "superadmin"],
  ["CENTRAL_PRESIDENT", "central-president"],
  ["CENTRAL_VICE_PRESIDENT", "central-vice-president"],
  ["CENTRAL_OPERATING_TEAM_MEMBER", "hq"],
  ["CENTRAL_EDUCATION_TEAM_MEMBER", "hq"],
  ["CHAPTER_PRESIDENT", "chapter"],
  ["SCHOOL_PRESIDENT", "school-president"],
  ["SCHOOL_VICE_PRESIDENT", "school-vice-president"],
  ["SCHOOL_PART_LEADER", "school"],
  ["SCHOOL_ETC_ADMIN", "school"],
]

describe("toRoleTag", () => {
  it("서버 역할을 피그마 역할 태그로 변환한다", () => {
    for (const [roleType, roleTag] of roleMappings) {
      expect(toRoleTag(roleType)).toBe(roleTag)
    }
  })
})
