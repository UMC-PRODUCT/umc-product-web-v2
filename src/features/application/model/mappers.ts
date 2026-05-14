// 서버 enum <-> 프론트 타입 매핑

import type {
  ApplicationStatusEnum,
  FormQuestion,
  FormResponseData,
  ManagedProjectSummaryResponse,
  MatchingPhase,
  PartEnum,
  ProjectApplicantResponse,
} from "./apiTypes"
import type { ApplicantFormData, FormField } from "./mockFormData"
import type {
  ApplicantDetail,
  AssignmentCount,
  ProjectApplication,
  Role,
  StatusValue,
} from "./types"

// 서버 status -> 프론트 status
const STATUS_MAP: Record<ApplicationStatusEnum, StatusValue> = {
  APPROVED: "pass",
  REJECTED: "fail",
  SUBMITTED: "pending",
}

export function toFrontStatus(
  serverStatus: ApplicationStatusEnum,
): StatusValue {
  return STATUS_MAP[serverStatus] ?? "pending"
}

// 프론트 status -> 서버 status (합불 결정 요청 시)
const REVERSE_STATUS_MAP: Record<
  StatusValue,
  "APPROVED" | "REJECTED" | "PENDING"
> = {
  pass: "APPROVED",
  fail: "REJECTED",
  pending: "PENDING",
}

export function toServerStatus(
  frontStatus: StatusValue,
): "APPROVED" | "REJECTED" | "PENDING" {
  return REVERSE_STATUS_MAP[frontStatus]
}

// 서버 part -> 프론트 role
const PART_MAP: Record<PartEnum, Role> = {
  PLAN: "plan",
  DESIGN: "design",
  WEB: "web",
  ANDROID: "android",
  IOS: "ios",
  NODEJS: "nodejs",
  SPRINGBOOT: "springboot",
}

export function toFrontRole(serverPart: PartEnum): Role {
  return PART_MAP[serverPart] ?? "plan"
}

// 서버 phase -> 프론트 라운드 번호
const PHASE_MAP: Record<MatchingPhase, number> = {
  FIRST: 1,
  SECOND: 2,
  THIRD: 3,
}

export function toRoundNumber(phase: MatchingPhase): number {
  return PHASE_MAP[phase] ?? 1
}

// 날짜 문자열 -> { date, time } 변환
export function toDateTimePair(
  isoString: string | null,
): { date: string; time: string } | null {
  if (!isoString) return null
  const d = new Date(isoString)
  if (isNaN(d.getTime())) return null
  const month = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  const hours = String(d.getHours()).padStart(2, "0")
  const minutes = String(d.getMinutes()).padStart(2, "0")
  return {
    date: `${month}/${day}`,
    time: `${hours}:${minutes}`,
  }
}

// --- 서버 응답 -> 프론트 모델 변환 ---

// partQuotas에서 특정 파트의 AssignmentCount 추출
function getQuotaCount(
  quotas: ManagedProjectSummaryResponse["partQuotas"],
  ...parts: PartEnum[]
): AssignmentCount {
  let current = 0
  let total = 0
  for (const q of quotas) {
    if (parts.includes(q.part)) {
      current += q.currentCount
      total += q.quota
    }
  }
  return { current, total }
}

// 서버 지원자 응답 -> 프론트 ApplicantDetail
export function toApplicantDetail(
  res: ProjectApplicantResponse,
): ApplicantDetail {
  return {
    id: String(res.applicationId),
    round: toRoundNumber(res.matchingRound.phase),
    role: toFrontRole(res.applicant.part),
    name: res.applicant.nickname || res.applicant.name,
    university: res.applicant.schoolName,
    status: toFrontStatus(res.status),
    processedAt: toDateTimePair(res.statusChangedAt),
    appliedAt: toDateTimePair(res.submittedAt) ?? { date: "", time: "" },
  }
}

// 서버 프로젝트 + 지원자 목록 -> 프론트 ProjectApplication
export function toProjectApplication(
  project: ManagedProjectSummaryResponse,
  applicants: ProjectApplicantResponse[],
): ProjectApplication {
  const statusLabel =
    project.partQuotaStatus === "RECRUITING" ? "모집 중" : "모집 완료"

  return {
    id: String(project.id),
    projectName: project.name,
    role: "plan", // PM 프로젝트이므로 기본값
    challengerName: project.productOwner.nickname || project.productOwner.name,
    challengerUniversity: project.productOwner.schoolName,
    statusLabel,
    designCount: getQuotaCount(project.partQuotas, "DESIGN"),
    feCount: getQuotaCount(project.partQuotas, "WEB"),
    beCount: getQuotaCount(project.partQuotas, "SPRINGBOOT", "NODEJS"),
    applicants: applicants.map(toApplicantDetail),
  }
}

// 질문의 답변 텍스트 추출
function extractAnswerText(question: FormQuestion): string {
  const { answer } = question
  if (!answer) return ""

  // 텍스트 답변 (SHORT_TEXT, LONG_TEXT)
  if (answer.textValue) return answer.textValue

  // 선택지 답변 (RADIO, CHECKBOX, DROPDOWN)
  if (answer.selectedOptions.length > 0) {
    return answer.selectedOptions.map((o) => o.answeredAsContent).join(", ")
  }

  // 파일 답변 (FILE, PORTFOLIO)
  if (answer.files.length > 0) {
    return answer.files.map((f) => f.originalFileName).join(", ")
  }

  // 일정 답변 (SCHEDULE)
  if (answer.times.length > 0) {
    return answer.times
      .map((t) => new Date(t).toLocaleDateString("ko-KR"))
      .join(", ")
  }

  return ""
}

// 서버 formResponse -> 프론트 ApplicantFormData
export function toApplicantFormData(
  formResponse: FormResponseData,
  applicantId: string,
): ApplicantFormData {
  const commonSection = formResponse.sections.find((s) => s.type === "COMMON")
  const partSection = formResponse.sections.find((s) => s.type === "PART")

  const toFormFields = (questions: FormQuestion[]): FormField[] =>
    questions
      .sort((a, b) => a.orderNo - b.orderNo)
      .map((q, i) => ({
        label: `Q${i + 1}`,
        question: q.title,
        answer: extractAnswerText(q),
        required: q.isRequired,
      }))

  return {
    applicantId,
    chapter: "",
    role: "plan",
    projectName: "",
    challengerName: "",
    challengerUniversity: "",
    commonFields: commonSection ? toFormFields(commonSection.questions) : [],
    roleSection: partSection
      ? {
          title: partSection.title,
          fields: toFormFields(partSection.questions),
        }
      : undefined,
  }
}
