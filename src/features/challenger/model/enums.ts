import type {
  Part,
  PointType,
  RoleType,
} from "@/features/challenger/model/types"

export const PART_OPTIONS: ReadonlyArray<{ value: Part; label: string }> = [
  { value: "PLAN", label: "Plan" },
  { value: "DESIGN", label: "Design" },
  { value: "WEB", label: "Web" },
  { value: "ANDROID", label: "Android" },
  { value: "IOS", label: "iOS" },
  { value: "NODEJS", label: "Node.js" },
  { value: "SPRINGBOOT", label: "SpringBoot" },
  { value: "ADMIN", label: "프로젝트 미참여 운영진" },
] as const

export const PART_LABEL: Record<Part, string> = PART_OPTIONS.reduce(
  (acc, { value, label }) => ({ ...acc, [value]: label }),
  {} as Record<Part, string>,
)

export const POINT_TYPE_OPTIONS: ReadonlyArray<{
  value: PointType
  label: string
}> = [
  { value: "BEST_WORKBOOK_V2", label: "베스트 워크북 선정" },
  { value: "BLOG_CHALLENGE", label: "블로그 챌린지 작성" },
  { value: "UMC_EVENT_REVIEW", label: "UMC 행사 후기 작성" },
  { value: "PEER_REVIEW_SUBMISSION", label: "피어 리뷰 제출" },
  { value: "NO_WORKBOOK_MISSION", label: "워크북 미션 미수행" },
  { value: "STUDY_LATE", label: "스터디 지각" },
  { value: "STUDY_ABSENT", label: "스터디 결석" },
  { value: "EVENT_LATE", label: "행사 지각" },
  { value: "EVENT_EARLY_LEAVE", label: "행사 조퇴" },
  { value: "EVENT_LATE_CANCEL", label: "취소 기한 이후 행사 취소" },
  { value: "EVENT_NO_SHOW", label: "행사 노쇼" },
  { value: "PART_LEAD_FEEDBACK_LATE", label: "파트장 피드백 지연" },
  { value: "SCHOOL_CORE_MEETING_ABSENT", label: "회장단 회의 미참여" },
  {
    value: "SCHOOL_CORE_TASK_NOT_COMPLETED",
    label: "학교 운영진 업무 미완료",
  },
  { value: "CUSTOM", label: "기타 (직접 입력)" },
] as const

interface PointTypeMeta {
  /** 백엔드 PointType 의 기본 점수 (가이드 0.4 표 참고). pointValue 미전달(null) 시 적용. */
  defaultPoint: number
  /** true 면 FE 에서 pointValue 명시 입력을 강제 (CUSTOM). */
  requiresOverride?: boolean
  /** legacy 라벨 fallback. POINT_TYPE_OPTIONS 가 큐레이션을 통해 가린 항목용. */
  fallbackLabel?: string
}

/**
 * 모든 PointType 값에 대한 메타 (기본점수 등). 과거 기록(legacy 포함) 표시용으로
 * deprecated 인 BEST_WORKBOOK 도 포함한다.
 */
export const POINT_TYPE_META: Record<PointType, PointTypeMeta> = {
  BLOG_CHALLENGE: { defaultPoint: 3 },
  BEST_WORKBOOK_V2: { defaultPoint: 2 },
  UMC_EVENT_REVIEW: { defaultPoint: 1 },
  PEER_REVIEW_SUBMISSION: { defaultPoint: 1 },
  OUT: { defaultPoint: 1, fallbackLabel: "탈부" },
  WARNING: { defaultPoint: 0, fallbackLabel: "경고" },
  CUSTOM: { defaultPoint: 0, requiresOverride: true },
  BEST_WORKBOOK: {
    defaultPoint: -0.5,
    fallbackLabel: "(구) 베스트 워크북",
  },
  STUDY_LATE: { defaultPoint: -2 },
  STUDY_ABSENT: { defaultPoint: -4 },
  EVENT_LATE: { defaultPoint: -2 },
  EVENT_EARLY_LEAVE: { defaultPoint: -2 },
  EVENT_LATE_CANCEL: { defaultPoint: -4 },
  EVENT_NO_SHOW: { defaultPoint: -10 },
  NO_WORKBOOK_MISSION: { defaultPoint: -4 },
  PART_LEAD_FEEDBACK_LATE: { defaultPoint: -4 },
  SCHOOL_CORE_MEETING_ABSENT: { defaultPoint: -4 },
  SCHOOL_CORE_TASK_NOT_COMPLETED: { defaultPoint: -4 },
}

/**
 * 라벨 조회용. POINT_TYPE_OPTIONS 의 큐레이션 라벨을 우선 사용하고, 없으면 META 의 fallback.
 * 모든 PointType (legacy 포함) 을 커버한다.
 */
export const POINT_TYPE_LABEL: Record<PointType, string> = (() => {
  const fromOptions = POINT_TYPE_OPTIONS.reduce(
    (acc, { value, label }) => ({ ...acc, [value]: label }),
    {} as Record<string, string>,
  )
  return Object.fromEntries(
    (Object.keys(POINT_TYPE_META) as PointType[]).map((value) => [
      value,
      fromOptions[value] ?? POINT_TYPE_META[value].fallbackLabel ?? value,
    ]),
  ) as Record<PointType, string>
})()

/** "+3" / "0" / "-2" / "-0.5" 형식으로 표기 */
export function formatSignedPoint(value: number): string {
  if (value > 0) return `+${value}`
  return String(value)
}

/**
 * 백엔드의 totalPoints / point 가 number · string · null 어느 형태로 와도
 * 안전하게 number 로 정규화한다. 변환 실패 시 0.
 */
export function toNumberSafe(value: unknown, fallback = 0): number {
  if (typeof value === "number" && !Number.isNaN(value)) return value
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value)
    if (!Number.isNaN(parsed)) return parsed
  }
  return fallback
}

export const ROLE_TYPE_OPTIONS: ReadonlyArray<{
  value: RoleType
  label: string
}> = [
  { value: "CHALLENGER", label: "챌린저" },
  { value: "SCHOOL_PART_LEADER", label: "학교 파트장" },
  { value: "SCHOOL_PRESIDENT", label: "학교 회장" },
  { value: "SCHOOL_VICE_PRESIDENT", label: "학교 부회장" },
  { value: "SCHOOL_ETC_ADMIN", label: "학교 기타 운영진" },
  { value: "CHAPTER_PRESIDENT", label: "지부장" },
  { value: "CENTRAL_PRESIDENT", label: "중앙운영사무국 총괄" },
  { value: "CENTRAL_VICE_PRESIDENT", label: "중앙운영사무국 부총괄" },
  { value: "CENTRAL_OPERATING_TEAM_MEMBER", label: "중앙운영사무국 운영팀원" },
  { value: "CENTRAL_EDUCATION_TEAM_MEMBER", label: "중앙운영사무국 교육팀원" },
  { value: "SUPER_ADMIN", label: "최고 관리자" },
] as const

export const ROLE_TYPE_LABEL: Record<RoleType, string> =
  ROLE_TYPE_OPTIONS.reduce(
    (acc, { value, label }) => ({ ...acc, [value]: label }),
    {} as Record<RoleType, string>,
  )

/**
 * 챌린저 기록 코드 발급 시 파트 선택이 필요한 역할.
 * - CHALLENGER: 본인 트랙(파트) 필요
 * - SCHOOL_PART_LEADER: 담당 파트 필요
 *
 * 그 외 운영진 역할은 특정 파트에 묶이지 않으므로 폼에서 파트 입력을 숨기고
 * 제출 시 `ADMIN` (운영진) 으로 자동 설정한다.
 */
export const PART_REQUIRING_ROLES: ReadonlySet<RoleType> = new Set([
  "CHALLENGER",
  "SCHOOL_PART_LEADER",
])

export function roleNeedsPart(roleType: RoleType | undefined): boolean {
  return roleType !== undefined && PART_REQUIRING_ROLES.has(roleType)
}

export const CHALLENGER_STATUS_LABEL = {
  ACTIVE: "활동중",
  GRADUATED: "수료",
  EXPELLED: "제명",
  WITHDRAWN: "탈퇴",
} as const
