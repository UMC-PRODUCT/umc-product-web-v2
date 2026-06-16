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

const CENTRAL_CORE_ROLE_TYPES: RoleType[] = [
  "SUPER_ADMIN",
  "CENTRAL_PRESIDENT",
  "CENTRAL_VICE_PRESIDENT",
]

const ADMIN_ROLE_TYPES: RoleType[] = [
  "SUPER_ADMIN",
  "CENTRAL_PRESIDENT",
  "CENTRAL_VICE_PRESIDENT",
  "CENTRAL_OPERATING_TEAM_MEMBER",
  "CENTRAL_EDUCATION_TEAM_MEMBER",
  "CHAPTER_PRESIDENT",
]

const SCHOOL_ROLE_TYPES: RoleType[] = [
  "SCHOOL_PRESIDENT",
  "SCHOOL_VICE_PRESIDENT",
  "SCHOOL_PART_LEADER",
  "SCHOOL_ETC_ADMIN",
]

const SCHOOL_LEADERSHIP_ROLE_TYPES: RoleType[] = [
  "SCHOOL_PRESIDENT",
  "SCHOOL_VICE_PRESIDENT",
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

export function isCentralCore(me: MemberInfoResponse | undefined): boolean {
  return hasAnyRoleType(me, CENTRAL_CORE_ROLE_TYPES)
}

export function isChapterPresident(
  me: MemberInfoResponse | undefined,
): boolean {
  return hasAnyRoleType(me, ["CHAPTER_PRESIDENT"])
}

export function isSchoolPresident(me: MemberInfoResponse | undefined): boolean {
  return hasAnyRoleType(me, ["SCHOOL_PRESIDENT"])
}

export function isSchoolVicePresident(
  me: MemberInfoResponse | undefined,
): boolean {
  return hasAnyRoleType(me, ["SCHOOL_VICE_PRESIDENT"])
}

export function isSchoolStaff(me: MemberInfoResponse | undefined): boolean {
  return hasAnyRoleType(me, SCHOOL_ROLE_TYPES)
}

export function isOperator(me: MemberInfoResponse | undefined): boolean {
  return hasAnyRoleType(me, ADMIN_ROLE_TYPES)
}

export function isSchoolLeadership(
  me: MemberInfoResponse | undefined,
): boolean {
  return hasAnyRoleType(me, SCHOOL_LEADERSHIP_ROLE_TYPES)
}

export function isAnyOperator(me: MemberInfoResponse | undefined): boolean {
  return isOperator(me) || isSchoolStaff(me)
}

export function canAccessProjectSettings(
  me: MemberInfoResponse | undefined,
): boolean {
  return isAnyOperator(me) || isCurrentTermPm(me)
}

export function canManageProjects(me: MemberInfoResponse | undefined): boolean {
  return isOperator(me) || isSchoolLeadership(me) || isCurrentTermPm(me)
}

export function canManageProjectRecruitInfo(
  me: MemberInfoResponse | undefined,
): boolean {
  return hasAnyRoleType(me, [...CENTRAL_CORE_ROLE_TYPES, "CHAPTER_PRESIDENT"])
}

export function canManageMatchingRounds(
  me: MemberInfoResponse | undefined,
): boolean {
  return hasAnyRoleType(me, [
    "SUPER_ADMIN",
    "CENTRAL_PRESIDENT",
    "CENTRAL_VICE_PRESIDENT",
    "CHAPTER_PRESIDENT",
  ])
}

export function getProjectPmSearchScope(me: MemberInfoResponse | undefined): {
  chapterId?: string
  schoolId?: string
} {
  if (isSuperAdmin(me) || isCentralStaff(me)) return {}
  if (isChapterPresident(me)) {
    const chapterId = me?.roles?.find(
      (r) => r.roleType === "CHAPTER_PRESIDENT",
    )?.organizationId
    return chapterId ? { chapterId } : {}
  }
  if (isSchoolLeadership(me)) {
    return me?.schoolId != null ? { schoolId: String(me.schoolId) } : {}
  }
  const latest = getLatestChallengerRecord(me)
  return latest?.chapterId ? { chapterId: latest.chapterId } : {}
}

export function isCurrentTermPm(me: MemberInfoResponse | undefined): boolean {
  return me?.currentGisuMemberInfo?.challenger?.part === "PLAN"
}

export function isProjectRegistrationQuotaLimited(
  me: MemberInfoResponse | undefined,
): boolean {
  if (isAnyOperator(me)) return false
  return isCurrentTermPm(me)
}

export function getViewerBranch(
  me: MemberInfoResponse | undefined,
): string | undefined {
  return getLatestChallengerRecord(me)?.chapterName
}

export function getLatestChallengerRecord(
  me: MemberInfoResponse | undefined,
): ChallengerInfoResponse | undefined {
  const records = me?.challengerRecords
  if (!records?.length) return undefined
  return [...records].sort((a, b) => Number(b.gisuId) - Number(a.gisuId))[0]
}
