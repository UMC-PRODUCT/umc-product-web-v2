// 회원(챌린저) 도메인 공통 타입. 기수/파트/역할/상태 등
// 여러 슬라이스가 공유하는 어휘라 entities/member에 둔다.

export type Part =
  | "PLAN"
  | "DESIGN"
  | "WEB"
  | "ANDROID"
  | "IOS"
  | "NODEJS"
  | "SPRINGBOOT"
  | "ADMIN"

export type ChallengerStatus = "ACTIVE" | "GRADUATED" | "EXPELLED" | "WITHDRAWN"

export type MemberStatus = "ACTIVE" | "INACTIVE" | "WITHDRAWN"

export type OrganizationType = "CENTRAL" | "CHAPTER" | "SCHOOL"

export type RoleType =
  | "CHALLENGER"
  | "SUPER_ADMIN"
  | "CENTRAL_PRESIDENT"
  | "CENTRAL_VICE_PRESIDENT"
  | "CENTRAL_OPERATING_TEAM_MEMBER"
  | "CENTRAL_EDUCATION_TEAM_MEMBER"
  | "CHAPTER_PRESIDENT"
  | "SCHOOL_PRESIDENT"
  | "SCHOOL_VICE_PRESIDENT"
  | "SCHOOL_PART_LEADER"
  | "SCHOOL_ETC_ADMIN"

export type PointType =
  | "BEST_WORKBOOK"
  | "WARNING"
  | "OUT"
  | "CUSTOM"
  | "BLOG_CHALLENGE"
  | "BEST_WORKBOOK_V2"
  | "UMC_EVENT_REVIEW"
  | "PEER_REVIEW_SUBMISSION"
  | "NO_WORKBOOK_MISSION"
  | "STUDY_LATE"
  | "STUDY_ABSENT"
  | "EVENT_LATE"
  | "EVENT_EARLY_LEAVE"
  | "EVENT_LATE_CANCEL"
  | "EVENT_NO_SHOW"
  | "PART_LEAD_FEEDBACK_LATE"
  | "SCHOOL_CORE_MEETING_ABSENT"
  | "SCHOOL_CORE_TASK_NOT_COMPLETED"

/**
 * 백엔드는 모든 ID 류 (`*Id`) 를 Java Long 정밀도 보전을 위해 numeric string 으로 직렬화한다.
 * FE 도 ID 는 string 으로 다룬다.
 */

export interface ChallengerPointInfo {
  id: string
  challengerId: string
  pointType: PointType
  /** 백엔드가 number/문자열로 줄 수 있음. 호출부에서 number 변환 필요 (toNumberSafe). */
  point: number | string | null
  description?: string | null
  createdAt: string
}

export interface ChallengerRoleResponse {
  challengerRoleId: string
  challengerId: string
  roleType: RoleType
  organizationType: OrganizationType
  organizationId: string
  responsiblePart?: Part
  gisuId: string
  /** 표시용 기수 번호 (e.g. "9"). */
  gisu: string
}

export interface ChallengerInfoResponse {
  challengerId: string
  memberId: string
  gisuId: string
  /** 표시용 기수 번호 */
  gisu: string
  chapterId: string
  chapterName: string
  part: Part
  challengerStatus: ChallengerStatus
  /** @deprecated `points` 사용 권장. 동일한 값. */
  challengerPoints?: ChallengerPointInfo[]
  points?: ChallengerPointInfo[]
  /** 합계 점수. 호출부에서 number 변환 필요 (toNumberSafe). */
  totalPoints?: number | string | null
  roles?: ChallengerRoleResponse[]
  name: string
  nickname: string
  /** Public View 에서는 null 로 마스킹됨 */
  email: string | null
  schoolId: string
  schoolName: string
  profileImageLink?: string | null
  /** Public View 에서는 null 로 마스킹됨 */
  memberStatus?: MemberStatus | null
  /** Public View 에서는 null 로 마스킹됨 */
  status?: MemberStatus | null
}
