// 도메인 공통 어휘(shared kernel). 기수/파트/역할/상태 등 순수 union 타입.
// 여러 entity(member, organization)와 feature가 공유하므로 shared에 둔다.

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
