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

// 화면 표시용 역할 분류 태그. 서버 RoleType(11종)을 표시 목적으로 축약한 어휘로,
// RoleType -> RoleTag 변환은 shared/lib/roleTagMapper의 toRoleTag가 담당한다.
export type RoleTag =
  | "hq"
  | "central-president"
  | "central-vice-president"
  | "chapter"
  | "school"
  | "school-president"
  | "school-vice-president"
  | "challenger"
  | "superadmin"
  | "product"

export const ROLE_TAG_LABEL: Record<RoleTag, string> = {
  hq: "중앙 운영진",
  "central-president": "총괄",
  "central-vice-president": "부총괄",
  chapter: "지부장",
  school: "교내 운영진",
  "school-president": "교내 회장",
  "school-vice-president": "교내 부회장",
  challenger: "챌린저",
  superadmin: "Admin",
  product: "Product",
}

// 화면 표시용 파트 분류 태그. 서버 Part enum(대문자)과 달리 프로덕트 전용
// 파트(pm/mobile-pe/web-pe)를 포함하는 표시 어휘다.
export type PartTag =
  | "plan"
  | "design"
  | "web"
  | "ios"
  | "android"
  | "springboot"
  | "nodejs"
  | "pm"
  | "mobile-pe"
  | "web-pe"

export const PART_TAG_LABEL: Record<PartTag, string> = {
  plan: "PM",
  design: "Design",
  web: "Web",
  ios: "iOS",
  android: "Android",
  springboot: "SpringBoot",
  nodejs: "Node.js",
  pm: "PM",
  "mobile-pe": "Mobile PE",
  "web-pe": "Web PE",
}

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

export type TermType = "SERVICE" | "PRIVACY" | "MARKETING" | "LOCATION"

export interface Term {
  id: number
  type: TermType
  typeDescription: string
  link: string
  isMandatory: boolean
  version: number
  createdAt: string
  updatedAt: string
}
