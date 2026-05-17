import type {
  ChallengerRoleResponse,
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

export function roleToViewMode(role: ChallengerRoleResponse): ViewMode {
  const { roleType, responsiblePart } = role
  if (roleType !== "CHALLENGER") return "admin"
  if (responsiblePart === "PLAN") return "pm"
  if (responsiblePart === "ADMIN") return "admin"
  return "others"
}

export function rolesToViewModes(
  roles: ChallengerRoleResponse[] | undefined,
): ViewMode[] {
  if (!roles?.length) return []
  const set = new Set<ViewMode>()
  for (const r of roles) set.add(roleToViewMode(r))
  const order: ViewMode[] = ["admin", "pm", "others"]
  return order.filter((m) => set.has(m))
}
