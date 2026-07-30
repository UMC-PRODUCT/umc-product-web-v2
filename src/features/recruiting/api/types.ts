export type RecruitingTrack =
  | "PLAN"
  | "DESIGN"
  | "WEB_PRODUCT_ENGINEER"
  | "MOBILE_PRODUCT_ENGINEER"
  | "INFRA_PLUS"

export type RecruitingApplicationStatus =
  | "DRAFT"
  | "SUBMITTED"
  | "DOCUMENT_FAILED"
  | "INTERVIEW_ASSIGNED"
  | "INTERVIEW_SKIPPED"
  | "FINAL_PASSED"
  | "FINAL_FAILED"
  | "CANCELLED"

export type RecruitingRegistrationStatus = "NOT_READY" | "READY" | "REGISTERED"

export type RecruitingRoundType = "REGULAR" | "ADDITIONAL"

export interface RecruitingRound {
  roundId: string
  title: string
  type: RecruitingRoundType
  roundNo: number
  recruitableTracks: RecruitingTrack[]
  secondChoiceEnabled: boolean
  documentStartAt: string | null
  documentEndAt: string | null
  documentResultPublishedAt: string | null
  interviewRequired: boolean
  interviewStartAt: string | null
  interviewEndAt: string | null
  finalResultPublishedAt: string | null
  announcement: string | null
  applicationFormId: string | null
  formId: string | null
  applicationOpen: boolean
}

export interface RecruitingRoundGroup {
  seasonId: string
  gisuId: string
  chapterId: string
  chapterName: string
  schoolId: string
  schoolName: string
  rounds: RecruitingRound[]
}

export interface RecruitingApplicationSummary {
  applicationId: string
  applicantName: string
  email: string
  applicantMemberId: string | null
  firstChoice: RecruitingTrack
  secondChoice: RecruitingTrack | null
  acceptedTrack: RecruitingTrack | null
  status: RecruitingApplicationStatus
  registrationStatus: RecruitingRegistrationStatus
  submittedAt: string | null
  documentEvaluatedByMe: boolean
  interviewEvaluatedByMe: boolean
}

export interface RecruitingApplicationPage {
  content: RecruitingApplicationSummary[]
  page: number
  size: number
  totalElements: number
  totalPages: number
  hasNext: boolean
  hasPrevious: boolean
}

// 공개 목록은 지원 기간이 열린 차수(OPEN)와 마감된 차수(PAST)를 따로 조회한다.
// 파라미터를 생략하면 서버가 OPEN 으로 간주해 마감된 차수가 빠진다.
export type RecruitingRoundPhase = "OPEN" | "PAST"

export interface PublicRoundsQuery {
  gisuId: string
  roundIds?: string[]
  phase?: RecruitingRoundPhase
}

export interface RoundApplicationsQuery {
  statuses?: RecruitingApplicationStatus[]
  tracks?: RecruitingTrack[]
  page?: number
  size?: number
}

export interface StatusSummaryQuery {
  gisuId: string
  schoolIds?: string[]
  roundIds?: string[]
  schoolName?: string
}

// 서버는 건수가 0 인 상태를 응답에서 아예 뺀다(2026-07-30 dev 확인: 지원서가
// 없는 기수는 countByStatus 가 {}). 그래서 Partial 로 두고 읽는 쪽에서 ?? 0 을 붙인다.
// 총 지원자 수는 이 값들의 합이 아니라 totalCount 를 써야 한다.
export type RecruitingStatusCounts = Partial<
  Record<RecruitingApplicationStatus, number>
>

export interface RecruitingRoundStatusSummary {
  roundId: string
  roundTitle: string
  roundType: RecruitingRoundType
  roundNo: number
  totalCount: number
  countByStatus: RecruitingStatusCounts
}

export interface RecruitingSchoolStatusSummary {
  schoolId: string
  schoolName: string
  // 지부명은 프론트 CHAPTERS 상수(6개)와 일치하지 않는다. dev 에는 지부가 32개
  // 있고 이름이 중복되는 건(Pegasus id 7/23)도 있어서 그룹핑 키로는 chapterId 를
  // 쓰고 chapterName 은 표시에만 쓴다.
  chapterId: string
  chapterName: string
  totalCount: number
  countByStatus: RecruitingStatusCounts
  rounds: RecruitingRoundStatusSummary[]
}

export interface RecruitingStatusSummary {
  totalCount: number
  countByStatus: RecruitingStatusCounts
  schools: RecruitingSchoolStatusSummary[]
}

// 스펙은 ID 와 건수를 모두 int64 로 적어두었지만 서버는 전부 문자열로 준다
// (2026-07-30 dev 확인: totalCount "0", schoolId "1", chapterId "27").
// ID 는 문자열로, 건수는 숫자로 고정해야 한다. 건수를 문자열로 두면 합산이
// 문자열 연결("0" + "10" = "010")이 되어 조용히 틀린 값이 나온다.
type RawId = string | number

export type RawCount = string | number

export type RawStatusCounts = Record<string, RawCount>

export type RawRoundStatusSummary = Omit<
  RecruitingRoundStatusSummary,
  "roundId" | "totalCount" | "countByStatus"
> & {
  roundId: RawId
  totalCount: RawCount
  countByStatus?: RawStatusCounts
}

export type RawSchoolStatusSummary = Omit<
  RecruitingSchoolStatusSummary,
  "schoolId" | "chapterId" | "totalCount" | "countByStatus" | "rounds"
> & {
  schoolId: RawId
  chapterId: RawId
  totalCount: RawCount
  countByStatus?: RawStatusCounts
  rounds?: RawRoundStatusSummary[]
}

export type RawStatusSummary = Omit<
  RecruitingStatusSummary,
  "totalCount" | "countByStatus" | "schools"
> & {
  totalCount: RawCount
  countByStatus?: RawStatusCounts
  schools?: RawSchoolStatusSummary[]
}

export type RecruitingQuestionType =
  | "SHORT_TEXT"
  | "LONG_TEXT"
  | "RADIO"
  | "CHECKBOX"
  | "DROPDOWN"
  | "SCHEDULE"
  | "FILE"
  | "PORTFOLIO"

export interface RecruitingFormOption {
  optionId: string
  content: string
  orderNo: number
  other: boolean
  nextSectionId: string | null
}

export interface RecruitingFormQuestion {
  questionId: string
  title: string
  description: string | null
  type: RecruitingQuestionType
  required: boolean
  orderNo: number
  options: RecruitingFormOption[]
}

export interface RecruitingFormSection {
  sectionId: string
  title: string
  description: string | null
  orderNo: number
  questions: RecruitingFormQuestion[]
}

export interface RecruitingFormStructure {
  formId: string
  title: string
  description: string | null
  sections: RecruitingFormSection[]
}

export interface RecruitingSelectedOption {
  questionOptionId: string | null
  answeredAsContent: string | null
}

// 서버가 선택지 답변을 id 배열에서 객체 배열로 옮기는 중이다. dev 는 아직
// selectedOptionIds 를 주고 원본은 selectedOptions 로 바뀌어 있어 둘 다 받는다.
export interface RecruitingApplicationAnswer {
  questionId: string
  type?: RecruitingQuestionType
  textValue: string | null
  selectedOptionIds?: string[]
  selectedOptions?: RecruitingSelectedOption[]
  fileIds: string[]
  times: string[]
}

export interface RecruitingApplicationDetail {
  application: RecruitingApplicationSummary
  formResponseId: string
  answers: RecruitingApplicationAnswer[]
}

export interface FormStructureQuery {
  firstChoice: RecruitingTrack
  secondChoice?: RecruitingTrack
}

export type ApiEvaluationStage = "DOCUMENT" | "INTERVIEW"

export type RecruitingEvaluationDecision = "APPROVED" | "REJECTED"

export interface RecruitingEvaluation {
  id: string
  applicationId: string
  evaluatorMemberId: string
  stage: ApiEvaluationStage
  decision: RecruitingEvaluationDecision
  comment: string | null
  submittedAt: string | null
}

export interface SubmitEvaluationBody {
  decision: RecruitingEvaluationDecision
  comment?: string
}

export interface RecruitingRoundEvaluator {
  id: string
  roundId: string
  memberId: string
}

export interface RecruitingInterviewQuestion {
  id: string
  roundId: string
  applicationId: string | null
  content: string
  orderNo: number
  active: boolean
}

export type RecruitingDecision = "PASS" | "FAIL"

// 합격에는 확정 트랙이 필수이고 지원자의 1·2지망 중 하나여야 한다. 불합격에는
// 담으면 거부되므로 두 형태를 타입으로 갈라 둔다.
export type FinalDecisionBody =
  | { decision: "PASS"; acceptedTrack: RecruitingTrack; reason?: string }
  | { decision: "FAIL"; reason?: string }
