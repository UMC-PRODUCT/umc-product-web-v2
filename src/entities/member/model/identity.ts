import type { MemberInfoResponse } from "@/entities/member/api/me"
import type {
  ChallengerInfoResponse,
  Part,
  RoleType,
} from "@/entities/member/model/challenger"

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

/** 설정(학교·지부·커리큘럼) 영역을 쓸 수 있는 범위. 헤더 `설정` 탭 노출 조건과 같다. */
export function isCentralAdmin(me: MemberInfoResponse | undefined): boolean {
  return isCentralCore(me)
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

/**
 * 학교 단위 역할 전부(회장·부회장·파트장·기타 운영진).
 *
 * 기획에서 쓰는 등급 이름 SCHOOL_STAFF 와 다르다. 그쪽은 기타 운영진 하나만
 * 가리킨다. 그 범위가 필요하면 isSchoolEtcAdmin 을 쓴다.
 */
export function isSchoolStaff(me: MemberInfoResponse | undefined): boolean {
  return hasAnyRoleType(me, SCHOOL_ROLE_TYPES)
}

/** 학교 기타 운영진. 기획의 SCHOOL_STAFF 등급이 이것이다. */
export function isSchoolEtcAdmin(me: MemberInfoResponse | undefined): boolean {
  return hasAnyRoleType(me, ["SCHOOL_ETC_ADMIN"])
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

/**
 * 리크루팅 화면에 들어올 수 있는 범위. 서버의 모집 READ 권한과 같다.
 *
 * 학교 운영진은 회장단뿐 아니라 파트장·기타 운영진까지 조회할 수 있다. 회장단만
 * 본다고 좁혀 두면 나머지는 헤더에 탭이 뜨지 않아 볼 수 있는 화면조차 못 찾는다.
 */
export function isRecruitingOperator(
  me: MemberInfoResponse | undefined,
): boolean {
  return isCentralCore(me) || isChapterPresident(me) || isSchoolStaff(me)
}

/**
 * 리크루팅을 고칠 수 있는 범위. 서버의 모집 WRITE·EDIT 권한과 같다.
 *
 * 조회보다 좁다. 학교는 회장단까지만 고칠 수 있어, 파트장·기타 운영진에게
 * 편집 화면을 열어 주면 눌러 놓고 저장에서 거부당한다.
 */
export function isRecruitingEditor(
  me: MemberInfoResponse | undefined,
): boolean {
  return isCentralCore(me) || isChapterPresident(me) || isSchoolLeadership(me)
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

export function getCurrentChallengerPart(
  me: MemberInfoResponse | undefined,
): Part | undefined {
  return me?.currentGisuMemberInfo?.challenger?.part
}
