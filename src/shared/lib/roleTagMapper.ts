import type { RoleType } from "@/shared/model/domain"
import type { Role } from "@/shared/ui/chip/RoleTagChip"

const ROLE_MAP: Record<RoleType, Role> = {
  CHALLENGER: "challenger",
  SUPER_ADMIN: "superadmin",
  CENTRAL_PRESIDENT: "hq",
  CENTRAL_VICE_PRESIDENT: "hq",
  CENTRAL_OPERATING_TEAM_MEMBER: "hq",
  CENTRAL_EDUCATION_TEAM_MEMBER: "hq",
  CHAPTER_PRESIDENT: "chapter",
  SCHOOL_PRESIDENT: "school",
  SCHOOL_VICE_PRESIDENT: "school",
  SCHOOL_PART_LEADER: "school",
  SCHOOL_ETC_ADMIN: "school",
}

export function toRoleTag(roleType: RoleType): Role {
  return ROLE_MAP[roleType]
}
