import type { RoleType } from "@/features/challenger"
import type { Role } from "@/shared/ui/chip/RoleTagChip"

// 서버 roleType -> 프로필 드롭다운 Role Tag
const ROLE_MAP: Record<RoleType, Role> = {
  CHALLENGER: "challenger",
  SUPER_ADMIN: "central",
  CENTRAL_PRESIDENT: "central",
  CENTRAL_VICE_PRESIDENT: "central",
  CENTRAL_OPERATING_TEAM_MEMBER: "central",
  CENTRAL_EDUCATION_TEAM_MEMBER: "central",
  CHAPTER_PRESIDENT: "central",
  SCHOOL_PRESIDENT: "campus",
  SCHOOL_VICE_PRESIDENT: "campus",
  SCHOOL_PART_LEADER: "campus",
  SCHOOL_ETC_ADMIN: "challenger",
}

export function toRoleTag(roleType: RoleType): Role {
  return ROLE_MAP[roleType]
}
