import type { MemberInfoResponse } from "@/features/auth/api/me"
import type {
  ChallengerInfoResponse,
  RoleType,
} from "@/features/challenger/model/types"

const CENTRAL_ROLE_TYPES: RoleType[] = [
  "CENTRAL_PRESIDENT",
  "CENTRAL_VICE_PRESIDENT",
  "CENTRAL_OPERATING_TEAM_MEMBER",
  "CENTRAL_EDUCATION_TEAM_MEMBER",
]

const SCHOOL_ROLE_TYPES: RoleType[] = [
  "SCHOOL_PRESIDENT",
  "SCHOOL_VICE_PRESIDENT",
  "SCHOOL_PART_LEADER",
  "SCHOOL_ETC_ADMIN",
]

export function hasAnyRoleType(
  me: MemberInfoResponse | undefined,
  types: RoleType[],
): boolean {
  if (!me?.roles?.length) return false
  return me.roles.some((r) => types.includes(r.roleType))
}

export function isSuperAdmin(me: MemberInfoResponse | undefined): boolean {
  return hasAnyRoleType(me, ["SUPER_ADMIN"])
}

export function isCentralStaff(me: MemberInfoResponse | undefined): boolean {
  return hasAnyRoleType(me, CENTRAL_ROLE_TYPES)
}

export function isChapterPresident(
  me: MemberInfoResponse | undefined,
): boolean {
  return hasAnyRoleType(me, ["CHAPTER_PRESIDENT"])
}

export function isSchoolStaff(me: MemberInfoResponse | undefined): boolean {
  return hasAnyRoleType(me, SCHOOL_ROLE_TYPES)
}

export function isOperator(me: MemberInfoResponse | undefined): boolean {
  return !!me?.roles?.length
}

export function isCurrentTermPm(me: MemberInfoResponse | undefined): boolean {
  if (!me?.challengerRecords?.length) return false
  const latest = latestRecord(me.challengerRecords)
  return latest?.part === "PLAN"
}

export function getViewerBranch(
  me: MemberInfoResponse | undefined,
): string | undefined {
  if (!me?.challengerRecords?.length) return undefined
  return latestRecord(me.challengerRecords)?.chapterName
}

function latestRecord(
  records: ChallengerInfoResponse[],
): ChallengerInfoResponse | undefined {
  return [...records].sort((a, b) => Number(b.gisuId) - Number(a.gisuId))[0]
}
