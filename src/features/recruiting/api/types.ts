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

// Round가 지원 Form과 함께 갖는 생명주기 상태.
export type RecruitingRoundStatus = "DRAFT" | "OPEN" | "CLOSED"

export interface UpdateRecruitingRoundStatusRequest {
  status: RecruitingRoundStatus
}

// getPublicRounds(/public/rounds)와 getAdminRounds(/admin/rounds)가 같은 타입을
// 공유하지만 실제 응답 스키마는 서로 달라 status/applicationOpen이 상호 배타적이다:
// admin 응답에만 status(DRAFT/OPEN/CLOSED)가 있고, public 응답에만 applicationOpen이 있다.
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
  // admin 전용
  status?: RecruitingRoundStatus
  availabilityFormId?: string | null
  contactText?: string | null
  // public 전용
  applicationOpen?: boolean
}

// interviewRequired=true 자체는 프론트에서 막아둔다 — 지원자가 면접 가능
// 시간대를 제출하는 백엔드 기능(RECRUITING-0419)이 아직 501 스텁이라, 지금
// 만들면 스케줄링이 동작하지 않는 반쪽짜리 라운드가 되기 때문이다.
export type CreateRecruitingRoundInterviewFields =
  | {
      interviewRequired: true
      interviewStartAt: string
      interviewEndAt: string
      availabilityFormId: string
    }
  | {
      interviewRequired: false
      interviewStartAt?: never
      interviewEndAt?: never
      availabilityFormId?: never
    }

export type CreateRecruitingRoundRequest = {
  title: string
  type: RecruitingRoundType
  // 본모집은 생략(자동 1), 추가모집은 이전 차수+1을 명시해야 함
  roundNo?: number
  recruitableTracks: RecruitingTrack[]
  secondChoiceEnabled?: boolean
  documentStartAt: string
  documentEndAt: string
  documentResultPublishedAt: string
  finalResultPublishedAt: string
  announcement?: string
  contactText?: string
} & CreateRecruitingRoundInterviewFields

// 생성과 달리 type/roundNo는 바꿀 수 없어(차수 자체를 재정의하는 값) 요청에서 빠진다.
// 나머지 필드(면접 유니언 포함)는 생성과 동일한 제약을 그대로 따른다.
export type UpdateRecruitingRoundRequest = {
  title: string
  recruitableTracks: RecruitingTrack[]
  secondChoiceEnabled?: boolean
  documentStartAt: string
  documentEndAt: string
  documentResultPublishedAt: string
  finalResultPublishedAt: string
  announcement?: string
  contactText?: string
} & CreateRecruitingRoundInterviewFields

// Round 설정, 지원 Form 전체 구조, 활성 공통 질문을 targetSeasonId의 새 DRAFT
// Round로 복제한다(RECRUITING-ADMIN-016).
export interface CloneRecruitingRoundRequest {
  targetSeasonId: string
  title: string
  type: RecruitingRoundType
  roundNo?: number
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

// 관리자용 차수 목록 조회(GET /admin/rounds) 쿼리.
// 공개 목록과 달리 시즌에 속한 차수가 하나도 없어도(=아직 "차수 생성"을 한 번도 안 한 시즌도) 결과에 포함된다.
export interface AdminRoundsQuery {
  gisuId: string
  chapterId?: string
  schoolId?: string
  seasonId?: string
  track?: RecruitingTrack
  sort?: "NEWEST" | "REGISTERED" | "RECRUITMENT"
}

export interface RoundApplicationsQuery {
  statuses?: RecruitingApplicationStatus[]
  tracks?: RecruitingTrack[]
  page?: number
  size?: number
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

export type RecruitingSectionType = "COMMON" | "TRACK"

// Form 전체 구조 Upsert(PUT .../rounds/{roundId}/form) 요청. Round가 DRAFT일 때만
// 호출 가능하고, 한 번에 section/question/option과 COMMON/TRACK 구성을 통째로
// 동기화한다. 신규 section/question/option은 sectionId/questionId/optionId가 없고,
// clientKey로만 식별한다 — 아직 실제 DB row가 없어서 조건부 이동(nextSectionKey)이 그 clientKey를 참조함
export interface UpsertRecruitingOptionRequest {
  optionId?: number
  content: string
  other: boolean
  nextSectionKey?: string
}

export interface UpsertRecruitingQuestionRequest {
  questionId?: number
  type: RecruitingQuestionType
  title: string
  description?: string
  required: boolean
  options?: UpsertRecruitingOptionRequest[]
}

export interface UpsertRecruitingSectionRequest {
  sectionId?: number
  clientKey: string
  title: string
  description?: string
  type: RecruitingSectionType
  track?: RecruitingTrack
  questions: UpsertRecruitingQuestionRequest[]
}

export interface UpsertRecruitingApplicationFormRequest {
  description?: string
  sections: UpsertRecruitingSectionRequest[]
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
