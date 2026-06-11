// 서버 응답 타입 (API 스펙 기반)

export type PartEnum =
  | "PLAN"
  | "DESIGN"
  | "WEB"
  | "ANDROID"
  | "IOS"
  | "NODEJS"
  | "SPRINGBOOT"

export type ApplicationStatusEnum = "SUBMITTED" | "APPROVED" | "REJECTED"

export type MatchingPhase = "FIRST" | "SECOND" | "THIRD"

export type MatchingType = "PLAN_DESIGN" | "PLAN_DEVELOPER"

// GET /api/v1/projects/{projectId}/applications 응답 항목
export interface ProjectApplicantResponse {
  applicationId: string
  applicant: {
    memberId: string
    nickname: string
    name: string
    schoolName: string
    part: PartEnum
  }
  matchingRound: {
    id: string
    type: MatchingType
    phase: MatchingPhase
  }
  status: ApplicationStatusEnum
  submittedAt: string
  statusChangedAt: string
}

// GET /api/v1/projects/{projectId}/applications/{applicationId} 응답
export interface ProjectApplicationDetailResponse extends ProjectApplicantResponse {
  formResponse: FormResponseData | null
}

// 지원서 폼 응답 (상세 조회 시 포함)
export interface FormResponseData {
  formResponseId: string
  formId: string
  status: "DRAFT" | "SUBMITTED"
  submittedAt: string
  lastSavedAt: string
  sections: FormSection[]
}

export interface FormSection {
  sectionId: string
  type: "COMMON" | "PART"
  allowedParts: PartEnum[]
  title: string
  description: string
  orderNo: number
  questions: FormQuestion[]
}

export interface FormQuestion {
  questionId: string
  type:
    | "SHORT_TEXT"
    | "LONG_TEXT"
    | "RADIO"
    | "CHECKBOX"
    | "DROPDOWN"
    | "SCHEDULE"
    | "FILE"
    | "PORTFOLIO"
  title: string
  description: string
  isRequired: boolean
  orderNo: number
  options: FormQuestionOption[]
  answer: FormAnswer | null
}

export interface FormQuestionOption {
  optionId: string
  content: string
  orderNo: number
  isOther: boolean
}

export interface FormAnswer {
  answerId: string
  answeredAsType: FormQuestion["type"]
  textValue: string | null
  selectedOptions: Array<{
    questionOptionId: string
    answeredAsContent: string
  }>
  files: Array<{
    fileId: string
    originalFileName: string
    url: string
  }>
  times: string[]
}

// GET /api/v1/projects/me/managed 응답
export interface ManagedProjectSummaryResponse {
  id: string
  name: string
  description: string
  thumbnailImageUrl: string
  status: string
  productOwner: {
    memberId: string
    nickname: string
    name: string
    schoolName: string
  }
  partQuotas: PartQuota[]
  partQuotaStatus: "RECRUITING" | "COMPLETED"
}

export interface PartQuota {
  part: PartEnum
  currentCount: string
  quota: string
  status: "RECRUITING" | "COMPLETED"
}

// GET /api/v1/project/matching-rounds 응답 항목
export interface MatchingRoundResponse {
  id: string
  name: string
  description: string
  type: MatchingType
  phase: MatchingPhase
  chapterId: string | null
  startsAt: string
  endsAt: string
  decisionDeadline: string
  autoDecisionExecutedAt: string | null
  autoDecisionExecutedMemberId: string | null
  createdAt: string
  updatedAt: string
}

// PATCH /api/v1/projects/{projectId}/applications/{applicationId}/decision
export interface DecisionRequest {
  status: "APPROVED" | "REJECTED" | "PENDING"
  reason?: string
}

export interface DecisionResponse {
  applicationId: string
  status: ApplicationStatusEnum
}

// POST /api/v1/project/matching-rounds
export interface CreateMatchingRoundRequest {
  name: string
  description?: string
  type: MatchingType
  phase: MatchingPhase
  chapterId: number
  startsAt: string // ISO 8601
  endsAt: string
  decisionDeadline: string
}

// PATCH /api/v1/project/matching-rounds/{matchingRoundId}
export interface UpdateMatchingRoundRequest {
  name?: string
  description?: string
  type?: MatchingType
  phase?: MatchingPhase
  startsAt?: string
  endsAt?: string
  decisionDeadline?: string
}

// ---- 통계 API 공통 타입 ----

// 통계 응답에 포함되는 매칭 차수 요약
export interface StatMatchingRound {
  matchingRoundId: string
  type: MatchingType
  phase: MatchingPhase
}

// ProjectMember에 포함된 지원 이력 항목
export interface MemberApplicationSummary {
  applicationId: string
  status: ApplicationStatusEnum | "DRAFT"
  matchingRound: StatMatchingRound
}

// 프로젝트 멤버 (ACTIVE) + 지원 이력
export interface ProjectMemberStat {
  projectMemberId: string
  memberId: string
  part: PartEnum
  status: "ACTIVE"
  applications: MemberApplicationSummary[]
}

// 차수별 지원자 수 / 지원 가능 인원
export interface RoundApplicationStat {
  matchingRound: StatMatchingRound
  appliedMemberCount: string
  availableMemberCount: string
}

// 학교별 지원자 수 (차수 단위)
export interface SchoolApplicationStat {
  matchingRound: StatMatchingRound
  schools: Array<{
    schoolId: string
    applicantCount: string
  }>
}

// GET /api/v1/projects/{projectId}/statistics 응답
export interface ProjectStatisticsResponse {
  projectId: string
  projectMembers: ProjectMemberStat[]
  roundApplicationStatistics: RoundApplicationStat[]
  schoolApplicationStatistics: SchoolApplicationStat[]
}

// GET /api/v1/projects/statistics 응답
export interface ChapterStatisticsResponse {
  chapterId: number
  projects: ProjectStatisticsResponse[]
  summary: {
    // N차 매칭 지원 현황 카드
    roundApplicationStatistics: RoundApplicationStat[]
    // N차 매칭 지원 Top N (학교별)
    roundSchoolRankings: SchoolApplicationStat[]
    // 총원 N명 카드 (학교별 매칭 완료 인원)
    schoolMatchingStatistics: Array<{
      schoolId: string
      matchedMemberCount: string
      totalMemberCount: string
    }>
    // 프로젝트별 차수별 지원 현황
    projectRoundStatistics: Array<{
      projectId: string
      matchingRounds: Array<{
        matchingRound: StatMatchingRound
        appliedMemberCount: string
        matchedMemberCount: string
      }>
    }>
  }
}

// 페이지네이션 공통
export interface PageResponse<T> {
  content: T[]
  page: string
  size: string
  totalElements: string
  totalPages: string
  hasNext: boolean
  hasPrevious: boolean
}
