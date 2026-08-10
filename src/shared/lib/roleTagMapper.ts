import type { RoleTag, RoleType } from "@/shared/model/domain"

const ROLE_MAP: Record<RoleType, RoleTag> = {
  CHALLENGER: "challenger",
  SUPER_ADMIN: "superadmin",
  CENTRAL_PRESIDENT: "central-president",
  CENTRAL_VICE_PRESIDENT: "central-vice-president",
  CENTRAL_OPERATING_TEAM_MEMBER: "hq",
  CENTRAL_EDUCATION_TEAM_MEMBER: "hq",
  CHAPTER_PRESIDENT: "chapter",
  SCHOOL_PRESIDENT: "school-president",
  SCHOOL_VICE_PRESIDENT: "school-vice-president",
  SCHOOL_PART_LEADER: "school",
  SCHOOL_ETC_ADMIN: "school",
}

export function toRoleTag(roleType: RoleType): RoleTag {
  return ROLE_MAP[roleType]
}
