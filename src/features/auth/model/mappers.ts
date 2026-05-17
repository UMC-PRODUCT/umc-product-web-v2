import type {
  MemberInfoResponse,
  RoleType,
} from "@/features/challenger/model/types"
import type { Role } from "@/shared/ui/chip/RoleTagChip"
import type { ViewMode } from "@/shared/view-mode"

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

export function memberToViewModes(
  me: MemberInfoResponse | undefined,
): ViewMode[] {
  if (!me) return []
  if (me.roles?.length) return ["admin"]
  const records = me.challengerRecords
  if (!records?.length) return []
  const latest = [...records].sort(
    (a, b) => Number(b.gisuId) - Number(a.gisuId),
  )[0]!
  if (latest.part === "PLAN") return ["pm"]
  return ["others"]
}
