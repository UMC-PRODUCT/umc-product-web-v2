import type { RoleType } from "@/shared/model/domain"

// 스펙은 ID 와 건수를 모두 int64 로 적어두었지만 서버는 전부 문자열로 준다
// (2026-07-30 dev 확인: totalCount "0", schoolId "1", chapterId "27").
// ID 는 문자열로, 건수는 숫자로 고정해야 한다. 건수를 문자열로 두면 합산이
// 문자열 연결("0" + "10" = "010")이 되어 조용히 틀린 값이 나온다.
export type RawId = string | number

export type RawCount = string | number

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

// 1지망 파트별 상태 교차집계. 서버는 INFRA_PLUS 를 뺀 4개 파트를 0건이어도 항상
// 반환한다(모집 대상이 아니라서). 파트 귀속은 firstChoice 기준이다.
//
// totalCount 와 parts 모두 DRAFT, CANCELLED 를 제외한다(2026-07-31 서버팀 확인).
// 스펙 설명에는 "전체 지원서 수"로만 적혀 있어 제외 여부가 드러나지 않는다.
// 두 값의 분모가 같으므로 총 지원자 카드 값과 파트 합계는 일치한다.
export interface RecruitingPartSummary {
  part: RecruitingTrack
  totalCount: number
  countByStatus: RecruitingStatusCounts
}

export interface RecruitingRoundStatusSummary {
  roundId: string
  roundTitle: string
  roundType: RecruitingRoundType
  roundNo: number
  totalCount: number
  countByStatus: RecruitingStatusCounts
  parts: RecruitingPartSummary[]
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
  parts: RecruitingPartSummary[]
  rounds: RecruitingRoundStatusSummary[]
}

export interface RecruitingStatusSummary {
  totalCount: number
  countByStatus: RecruitingStatusCounts
  parts: RecruitingPartSummary[]
  schools: RecruitingSchoolStatusSummary[]
}

export type RawStatusCounts = Record<string, RawCount>

export type RawPartSummary = Omit<
  RecruitingPartSummary,
  "totalCount" | "countByStatus"
> & {
  totalCount: RawCount
  countByStatus?: RawStatusCounts
}

export type RawRoundStatusSummary = Omit<
  RecruitingRoundStatusSummary,
  "roundId" | "totalCount" | "countByStatus" | "parts"
> & {
  roundId: RawId
  totalCount: RawCount
  countByStatus?: RawStatusCounts
  parts?: RawPartSummary[]
}

export type RawSchoolStatusSummary = Omit<
  RecruitingSchoolStatusSummary,
  "schoolId" | "chapterId" | "totalCount" | "countByStatus" | "parts" | "rounds"
> & {
  schoolId: RawId
  chapterId: RawId
  totalCount: RawCount
  countByStatus?: RawStatusCounts
  parts?: RawPartSummary[]
  rounds?: RawRoundStatusSummary[]
}

export type RawStatusSummary = Omit<
  RecruitingStatusSummary,
  "totalCount" | "countByStatus" | "parts" | "schools"
> & {
  totalCount: RawCount
  countByStatus?: RawStatusCounts
  parts?: RawPartSummary[]
  schools?: RawSchoolStatusSummary[]
}

// 평가 현황 집계 (RECRUITING-ADMIN-083). 지원 현황(081)과 달리 파트(track)별
// 집계와 asOf 를 준다. 대신 필터가 gisuId 하나뿐이다.
//
// 서버 집계 기준(스펙 명시):
// - applicantCount: DRAFT, CANCELLED 제외
// - evaluatedCount: DOCUMENT_FAILED, FINAL_PASSED, FINAL_FAILED (판정 확정)
// - byTrack: 1지망(firstChoice) 기준. 2지망을 포함하면 파트 합계가 총원을 넘는다.
// - INFRA_PLUS 를 뺀 4개 트랙을 0건이어도 항상 반환
// - 정렬(지부 가나다 > 학교 가나다)과 0건 학교 포함을 서버가 처리
// - 비율은 서버가 주지 않는다. 클라이언트에서 계산한다.
//
// 081 의 totalCount 와 여기의 applicantCount 는 제외 규칙이 달라 값이 어긋날 수
// 있다. 두 API 를 한 화면에서 섞지 않는다.
export interface RecruitingTrackCount {
  track: RecruitingTrack
  applicantCount: number
  evaluatedCount: number
}

export interface RecruitingSchoolEvaluationStatistics {
  schoolId: string
  schoolName: string
  applicantCount: number
  evaluatedCount: number
  byTrack: RecruitingTrackCount[]
}

export interface RecruitingChapterEvaluationStatistics {
  chapterId: string
  chapterName: string
  applicantCount: number
  evaluatedCount: number
  byTrack: RecruitingTrackCount[]
  schools: RecruitingSchoolEvaluationStatistics[]
}

export interface RecruitingEvaluationStatistics {
  /** 집계 기준 시각(ISO). 클라이언트 조회 시각과 다르다. */
  asOf: string | null
  applicantCount: number
  evaluatedCount: number
  byTrack: RecruitingTrackCount[]
  chapters: RecruitingChapterEvaluationStatistics[]
}

export type RawTrackCount = Omit<
  RecruitingTrackCount,
  "applicantCount" | "evaluatedCount"
> & {
  applicantCount: RawCount
  evaluatedCount: RawCount
}

export type RawSchoolEvaluationStatistics = Omit<
  RecruitingSchoolEvaluationStatistics,
  "schoolId" | "applicantCount" | "evaluatedCount" | "byTrack"
> & {
  schoolId: RawId
  applicantCount: RawCount
  evaluatedCount: RawCount
  byTrack?: RawTrackCount[]
}

export type RawChapterEvaluationStatistics = Omit<
  RecruitingChapterEvaluationStatistics,
  "chapterId" | "applicantCount" | "evaluatedCount" | "byTrack" | "schools"
> & {
  chapterId: RawId
  applicantCount: RawCount
  evaluatedCount: RawCount
  byTrack?: RawTrackCount[]
  schools?: RawSchoolEvaluationStatistics[]
}

export type RawEvaluationStatistics = Omit<
  RecruitingEvaluationStatistics,
  "asOf" | "applicantCount" | "evaluatedCount" | "byTrack" | "chapters"
> & {
  asOf?: string | null
  applicantCount: RawCount
  evaluatedCount: RawCount
  byTrack?: RawTrackCount[]
  chapters?: RawChapterEvaluationStatistics[]
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

// 지원서 저장 요청의 답변 한 건. SCHEDULE 문항의 times 를 받는 필드가 없어
// 일정 답변은 이 경로로 보낼 수 없다(RECRUITING-SCHEDULE-001 이 미구현).
export interface RecruitingAnswerRequest {
  questionId: number
  textValue?: string
  selectedOptionIds?: number[]
  fileIds?: string[]
}

// 이름·이메일·지망은 Form 문항이 아니라 지원서 자체의 필드다.
export interface CreateApplicationDraftBody {
  applicationFormId: number
  applicantName: string
  applicantEmail: string
  firstChoice: RecruitingTrack
  secondChoice?: RecruitingTrack
}

export interface UpdateApplicationDraftBody {
  applicantName: string
  applicantEmail: string
  firstChoice: RecruitingTrack
  secondChoice?: RecruitingTrack
  answers: RecruitingAnswerRequest[]
}

export interface RecruitingApplicationCreated {
  applicationId: string
  applicationKey: string
  status: RecruitingApplicationStatus
}

export interface RecruitingApplicationMutationResult {
  applicationId: string
  status: RecruitingApplicationStatus
}

// 익명 지원서 조회/철회 자격 증명 요청 DTO
export interface RecruitingApplicationCredentialRequest {
  email: string
  applicationKey: string
}

// 익명 지원서 수정 요청 DTO
export interface UpdateAnonymousApplicationRequest {
  credentialEmail: string
  applicationKey: string
  applicantName: string
  applicantEmail: string
  firstChoice: RecruitingTrack
  secondChoice?: RecruitingTrack
  answers: RecruitingAnswerRequest[]
}

// 익명 지원서 제출 요청 DTO
export interface SubmitAnonymousApplicationRequest {
  email: string
  applicationKey: string
}

// 익명 지원서 조회 응답 내 문항 답변 DTO
export interface RecruitingPublicApplicationAnswer {
  questionId?: number
  textValue?: string
  selectedOptionIds?: number[]
  fileIds?: string[]
  times?: string[]
}

// 익명 지원서 조회 응답 DTO
export interface RecruitingPublicApplicationResponse {
  applicationId?: number
  applicantName?: string
  applicantEmail?: string
  firstChoice?: RecruitingTrack
  secondChoice?: RecruitingTrack
  submitted?: boolean
  cancelled?: boolean
  editable?: boolean
  documentResult?: "PENDING" | "APPROVED" | "REJECTED"
  finalResult?: "PENDING" | "APPROVED" | "REJECTED"
  acceptedTrack?: RecruitingTrack
  answers?: RecruitingPublicApplicationAnswer[]
}

export type RecruitingDecision = "PASS" | "FAIL"

// 합격에는 확정 트랙이 필수이고 지원자의 1·2지망 중 하나여야 한다. 불합격에는
// 담으면 거부되므로 두 형태를 타입으로 갈라 둔다.
export type FinalDecisionBody =
  | { decision: "PASS"; acceptedTrack: RecruitingTrack; reason?: string }
  | { decision: "FAIL"; reason?: string }

// 평가 이력 (RECRUITING-ADMIN-091). 교내 회장단이 내린 판정을 중앙이 감사하는
// read-only 목록이라 SUPER_ADMIN 과 기수 내 중앙운영사무국만 조회할 수 있다.
// 학교·지부 운영진은 감사 대상이라 403 을 받는다.
//
// 판정이 확정되는 시점(DOCUMENT_FAILED, FINAL_PASSED, FINAL_FAILED)에만 1행이
// 남는다. 서류 합격은 면접으로 넘어가는 중간 상태라 기록되지 않는다.
export type RecruitingDecisionResult = "PASSED" | "FAILED"

export type RecruitingHistoryProgressStatus =
  | "BEFORE_EVALUATION"
  | "IN_PROGRESS"
  | "COMPLETED"

export type RecruitingHistorySort = "LATEST" | "OLDEST"

export interface RecruitingDecisionApplicant {
  chapterId: string
  chapterName: string
  schoolId: string
  schoolName: string
  name: string
  firstChoice: RecruitingTrack
  secondChoice: RecruitingTrack | null
  acceptedTrack: RecruitingTrack | null
}

// 직위(roleType)는 판정 시점 스냅샷이라 이후 직위가 바뀌어도 보존된다.
// 중앙 직위와 SUPER_ADMIN 은 지부·학교가 null 이다.
export interface RecruitingDecisionDecider {
  memberId: string
  chapterId: string | null
  chapterName: string | null
  schoolId: string | null
  schoolName: string | null
  roleType: RoleType
  name: string
  nickname: string
}

export interface RecruitingDecisionHistory {
  decisionHistoryId: string
  applicationId: string
  decidedAt: string
  decisionStatus: RecruitingApplicationStatus
  result: RecruitingDecisionResult
  applicant: RecruitingDecisionApplicant
  decider: RecruitingDecisionDecider
}

export interface RecruitingDecisionHistoryPage {
  /** 집계 기준 시각 */
  asOf: string | null
  /** 판정 대상 전원 완료 기준. 0건 BEFORE_EVALUATION / 일부 IN_PROGRESS / 전원 COMPLETED */
  progressStatus: RecruitingHistoryProgressStatus
  content: RecruitingDecisionHistory[]
  page: number
  size: number
  totalElements: number
  totalPages: number
  hasNext: boolean
  hasPrevious: boolean
}

export interface DecisionHistoriesQuery {
  gisuId: string
  // 반복 쿼리 파라미터로 보낸다(chapterIds=1&chapterIds=2). 각 목록 내부는 OR,
  // 지부와 학교를 함께 주면 AND 로 범위를 좁힌다. "[]" 접미사 키는 쓰지 않는다.
  chapterIds?: string[]
  schoolIds?: string[]
  tracks?: RecruitingTrack[]
  results?: RecruitingDecisionResult[]
  searchName?: string
  sort?: RecruitingHistorySort
  groupByDecider?: boolean
  page?: number
  size?: number
}

export type RawDecisionApplicant = Omit<
  RecruitingDecisionApplicant,
  "chapterId" | "schoolId"
> & { chapterId: RawId; schoolId: RawId }

export type RawDecisionDecider = Omit<
  RecruitingDecisionDecider,
  "memberId" | "chapterId" | "schoolId"
> & {
  memberId: RawId
  chapterId?: RawId | null
  schoolId?: RawId | null
}

export type RawDecisionHistory = Omit<
  RecruitingDecisionHistory,
  "decisionHistoryId" | "applicationId" | "applicant" | "decider"
> & {
  decisionHistoryId: RawId
  applicationId: RawId
  applicant: RawDecisionApplicant
  decider: RawDecisionDecider
}

export interface RawDecisionHistoryPage {
  asOf?: string | null
  progressStatus: RecruitingHistoryProgressStatus
  histories?: {
    content?: RawDecisionHistory[]
    page?: RawCount
    size?: RawCount
    totalElements?: RawCount
    totalPages?: RawCount
    hasNext?: boolean
    hasPrevious?: boolean
  }
}
