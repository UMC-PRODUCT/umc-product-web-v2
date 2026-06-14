// 서버 enum <-> 프론트 타입 매핑

export function shortenSchoolName(name: string): string {
  return name
    .replace(/캠퍼스/, "")
    .replace(/외국어대학교/, "외대")
    .replace(/여자대학교/, "여대")
    .replace(/대학교/, "대")
    .replace(/학교$/, "")
}

import type {
  ApplicationStatusEnum,
  ChapterStatisticsResponse,
  FormQuestion,
  FormResponseData,
  ManagedProjectSummaryResponse,
  MatchingRoundPhaseView,
  PartEnum,
  ProjectApplicantResponse,
} from "./apiTypes"
import type { ApplicantFormData, FormField } from "./types"
import type {
  ApplicantDetail,
  ApplicationStats,
  AssignmentCount,
  ProjectApplication,
  ProjectRoundData,
  Role,
  StatusValue,
  TopProject,
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

// 서버 phase -> 프론트 라운드 번호 (RANDOM_MATCHING은 0으로 처리 - 실제로 응답에 오지 않음)
const PHASE_MAP: Record<MatchingRoundPhaseView, number> = {
  FIRST: 1,
  SECOND: 2,
  THIRD: 3,
  RANDOM_MATCHING: 0,
}

export function toRoundNumber(phase: MatchingRoundPhaseView): number {
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
      current += Number(q.currentCount)
      total += Number(q.quota)
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

  // quota > 0인 파트만 추출 (plan 제외 - PM은 항상 plan이므로)
  const parts = project.partQuotas
    .filter((q) => Number(q.quota) > 0 && q.part !== "PLAN")
    .map((q) => toFrontRole(q.part))

  return {
    id: String(project.id),
    projectName: project.name,
    role: "plan", // PM 프로젝트이므로 기본값
    parts,
    challengerName: project.productOwner.nickname
      ? `${project.productOwner.nickname}/${project.productOwner.name}`
      : project.productOwner.name,
    challengerUniversity: project.productOwner.schoolName,
    thumbnailUrl: project.thumbnailImageUrl || undefined,
    statusLabel,
    designCount: getQuotaCount(project.partQuotas, "DESIGN"),
    feCount: getQuotaCount(project.partQuotas, "WEB"),
    beCount: getQuotaCount(project.partQuotas, "SPRINGBOOT", "NODEJS"),
    applicants: applicants.map(toApplicantDetail),
  }
}

// ChapterStatisticsSummary -> ApplicationStats 변환
// universities는 schoolId만 있어 이름 알 수 없으므로 호출자가 별도 주입
export function summaryToStats(
  summary: ChapterStatisticsResponse["summary"],
  projectIdToName: Map<string, string>,
  filterRound?: number, // 미지정 시 전 차수 합산, 0 = 완료된 차수 없음, N = N차까지 표시
  variant: "application" | "matching" = "application",
): Omit<ApplicationStats, "universities"> {
  // 차수별 매칭 완료 수 (projectRoundStatistics에서 합산)
  const matchedByPhase = new Map<string, number>()
  if (variant === "matching") {
    for (const p of summary.projectRoundStatistics) {
      for (const r of p.matchingRounds) {
        const phase = r.matchingRound.phase
        matchedByPhase.set(
          phase,
          (matchedByPhase.get(phase) ?? 0) + Number(r.matchedMemberCount),
        )
      }
    }
  }

  // 차수별 지원/매칭 현황 (완료 차수 + 1차 최소 표시)
  // filterRound=0(1차 진행 중)이어도 r.total(availableMemberCount)이 표시되도록 최소 1차 포함
  const rounds = summary.roundApplicationStatistics
    .map((r) => ({
      round: toRoundNumber(r.matchingRound.phase),
      applied:
        variant === "matching"
          ? (matchedByPhase.get(r.matchingRound.phase) ?? 0)
          : Number(r.appliedMemberCount),
      total: Number(r.availableMemberCount),
    }))
    .filter(
      (r) => filterRound === undefined || r.round <= Math.max(1, filterRound),
    )

  // 총원 / 매칭 완료 (schoolMatchingStatistics 합산)
  // 서버가 숫자 필드를 문자열로 내려주므로 Number() 변환 필요
  const totalMembers = summary.schoolMatchingStatistics.reduce(
    (s, x) => s + Number(x.totalMemberCount),
    0,
  )
  const completedCount = summary.schoolMatchingStatistics.reduce(
    (s, x) => s + Number(x.matchedMemberCount),
    0,
  )
  const pendingCount = Math.max(0, totalMembers - completedCount)
  const completionRate =
    totalMembers > 0 ? Math.round((completedCount / totalMembers) * 100) : 0

  // 프로젝트별 차수별 지원/매칭 현황 (완료된 차수만)
  const projectRoundField =
    variant === "matching" ? "matchedMemberCount" : "appliedMemberCount"
  const projectRounds: ProjectRoundData[] = summary.projectRoundStatistics.map(
    (p) => ({
      name: projectIdToName.get(String(p.projectId)) ?? String(p.projectId),
      rounds: [
        filterRound === undefined || filterRound >= 1
          ? Number(
              p.matchingRounds.find((r) => r.matchingRound.phase === "FIRST")?.[
                projectRoundField
              ] ?? 0,
            )
          : 0,
        filterRound === undefined || filterRound >= 2
          ? Number(
              p.matchingRounds.find(
                (r) => r.matchingRound.phase === "SECOND",
              )?.[projectRoundField] ?? 0,
            )
          : 0,
        filterRound === undefined || filterRound >= 3
          ? Number(
              p.matchingRounds.find((r) => r.matchingRound.phase === "THIRD")?.[
                projectRoundField
              ] ?? 0,
            )
          : 0,
      ],
    }),
  )

  // Top 4 프로젝트 (filterRound 지정 시 해당 차수, 미지정 시 전 차수 합산, 0이면 전체 0)
  const phaseMap: Record<number, "FIRST" | "SECOND" | "THIRD"> = {
    1: "FIRST",
    2: "SECOND",
    3: "THIRD",
  }
  const countField =
    variant === "matching" ? "matchedMemberCount" : "appliedMemberCount"
  const topProjects: TopProject[] = summary.projectRoundStatistics
    .map((p) => {
      let count = 0
      if (filterRound === undefined) {
        count = p.matchingRounds.reduce((s, r) => s + Number(r[countField]), 0)
      } else if (filterRound > 0) {
        const targetPhase = phaseMap[filterRound]
        count = Number(
          p.matchingRounds.find((r) => r.matchingRound.phase === targetPhase)?.[
            countField
          ] ?? 0,
        )
      }
      return {
        projectId: p.projectId,
        name: projectIdToName.get(String(p.projectId)) ?? String(p.projectId),
        count,
      }
    })
    .sort(
      (a, b) => b.count - a.count || Number(a.projectId) - Number(b.projectId),
    )
    .slice(0, 4)

  return {
    totalMembers,
    completionRate,
    completedCount,
    pendingCount,
    rounds,
    topProjects,
    projectRounds,
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

// 질문의 파일 링크 추출
function extractAnswerLinks(
  question: FormQuestion,
): Array<{ label: string; url: string }> {
  const { answer } = question
  if (!answer) return []
  return answer.files
    .filter((f) => f.url)
    .map((f) => ({ label: f.originalFileName, url: f.url }))
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
      .sort((a, b) => Number(a.orderNo) - Number(b.orderNo))
      .map((q, i) => {
        const links = extractAnswerLinks(q)
        return {
          label: `Q${i + 1}`,
          question: q.title,
          answer: extractAnswerText(q),
          ...(links.length > 0 && { links }),
          required: q.isRequired,
        }
      })

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
