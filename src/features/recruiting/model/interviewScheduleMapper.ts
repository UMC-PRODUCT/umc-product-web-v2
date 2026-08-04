import dayjs from "dayjs"
import utc from "dayjs/plugin/utc"

import type {
  RecruitingBoardSession,
  RecruitingInterviewMode,
  RecruitingInterviewSession,
  RecruitingInterviewSessionRequest,
} from "../api/types"
import type {
  InterviewApplicant,
  InterviewMode,
  InterviewSession,
  SlotAssignment,
} from "./interviewSchedule"

dayjs.extend(utc)

// 면접 일정은 운영진이 한국 시간으로 다룬다. 서버는 UTC Instant 로 주고받으므로
// 날짜 탭과 "HH:mm" 입력을 KST 로 해석해 변환한다.
const KST_OFFSET_MINUTES = 9 * 60

// 서버가 15 의 양의 배수만 받는다. 화면에서 미리 막아 거부당하지 않게 한다.
export const SLOT_DURATION_UNIT_MINUTES = 15

export function isValidSlotDuration(minutes: number): boolean {
  return (
    Number.isInteger(minutes) &&
    minutes > 0 &&
    minutes % SLOT_DURATION_UNIT_MINUTES === 0
  )
}

const MODE_TO_SERVER: Record<InterviewMode, RecruitingInterviewMode> = {
  online: "ONLINE",
  offline: "OFFLINE",
}

export function toServerMode(mode: InterviewMode): RecruitingInterviewMode {
  return MODE_TO_SERVER[mode]
}

export function toClientMode(mode: RecruitingInterviewMode): InterviewMode {
  return mode === "OFFLINE" ? "offline" : "online"
}

// Instant 를 KST 로 옮겨 날짜 탭 키와 시각 라벨을 뽑는다.
export function toKstDateKey(instant: string): string {
  return dayjs(instant).utcOffset(KST_OFFSET_MINUTES).format("YYYY-MM-DD")
}

export function toKstTimeLabel(instant: string): string {
  return dayjs(instant).utcOffset(KST_OFFSET_MINUTES).format("HH:mm")
}

// 날짜 탭과 "HH:mm" 을 합쳐 서버가 받는 Instant 로 만든다. 형식이 어긋나면
// null 을 돌려주고 호출부가 저장을 막는다.
export function toInstant(dateKey: string, time: string): string | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateKey)) return null
  if (!/^\d{2}:\d{2}$/.test(time)) return null

  const parsed = dayjs
    .utc(`${dateKey}T${time}:00`)
    .subtract(KST_OFFSET_MINUTES, "minute")
  return parsed.isValid() ? parsed.toISOString() : null
}

// 화면 편집용 세션. 저장 전 행은 draft- 로 시작하는 임시 id 를 갖고, 저장하면
// 서버가 발급한 id 로 바뀐다.
export type EditableSession = InterviewSession & { slotDurationMinutes: number }

// 서버 세션을 화면 편집 모델로 옮긴다. 화면은 날짜 탭 안에서 시각만 다루므로
// 날짜 부분은 떼어 낸다.
export function toEditableSession(
  session: RecruitingInterviewSession,
): EditableSession {
  return {
    id: session.id,
    name: session.name,
    startTime: toKstTimeLabel(session.startsAt),
    endTime: toKstTimeLabel(session.endsAt),
    mode: toClientMode(session.mode),
    place: session.location,
    slotDurationMinutes: session.slotDurationMinutes,
  }
}

// 화면 편집 모델을 서버 요청으로 되돌린다. 시각이 읽히지 않으면 null 이다.
export function toSessionRequest(
  session: EditableSession,
  dateKey: string,
): RecruitingInterviewSessionRequest | null {
  const startsAt = toInstant(dateKey, session.startTime)
  const endsAt = toInstant(dateKey, session.endTime)
  if (startsAt == null || endsAt == null) return null
  if (!dayjs(startsAt).isBefore(dayjs(endsAt))) return null
  if (!isValidSlotDuration(session.slotDurationMinutes)) return null
  if (session.name.trim() === "" || session.place.trim() === "") return null

  return {
    name: session.name.trim(),
    startsAt,
    endsAt,
    slotDurationMinutes: session.slotDurationMinutes,
    mode: toServerMode(session.mode),
    location: session.place.trim(),
  }
}

// 보드 응답의 세션·슬롯을 화면이 그리는 배정 목록으로 편다. 슬롯 시각은 서버가
// 계산해 주므로 클라이언트가 다시 만들지 않는다.
export function toAssignmentsFromBoard(
  sessions: RecruitingBoardSession[],
): SlotAssignment[] {
  return sessions.flatMap((session) =>
    session.slots.flatMap((slot) =>
      slot.assignedApplicant
        ? [
            {
              sessionId: session.sessionId,
              slotStart: toKstTimeLabel(slot.startsAt),
              applicantId: slot.assignedApplicant.applicationId,
            },
          ]
        : [],
    ),
  )
}

// 슬롯마다 오는 availableApplicationIds 를 지원자 기준으로 뒤집는다. 화면은
// 지원자 칩에 가능 시간대를 보여주기 때문이다.
export function toApplicantAvailabilities(
  sessions: RecruitingBoardSession[],
): Map<string, string[]> {
  const byApplicant = new Map<string, string[]>()

  sessions.forEach((session) => {
    session.slots.forEach((slot) => {
      const label = toKstTimeLabel(slot.startsAt)
      slot.availableApplicationIds.forEach((applicationId) => {
        const times = byApplicant.get(applicationId)
        if (times) {
          if (!times.includes(label)) times.push(label)
          return
        }
        byApplicant.set(applicationId, [label])
      })
    })
  })

  return byApplicant
}

export function toInterviewApplicants(
  applicants: { applicationId: string; applicantName: string }[],
  availabilities: Map<string, string[]>,
): InterviewApplicant[] {
  return applicants.map((applicant) => ({
    id: applicant.applicationId,
    name: applicant.applicantName,
    availabilities: availabilities.get(applicant.applicationId) ?? [],
  }))
}

export interface AssignmentPayloadResult {
  assignments: {
    applicationId: number
    sessionId: number
    startsAt: string
    contactSnapshot: string
  }[]
  // 연락처를 찾지 못해 확정에서 빠진 지원자. 서버가 빈 값을 거부하므로 보내지 않는다.
  skipped: string[]
}

// 배정 목록을 일괄 확정 요청으로 조립한다. 연락처는 보드 응답에 없어 지원자
// 목록에서 끌어온다.
export function buildAssignmentPayload(
  assignments: SlotAssignment[],
  dateKey: string,
  contactByApplicationId: Map<string, string>,
): AssignmentPayloadResult {
  const result: AssignmentPayloadResult = { assignments: [], skipped: [] }

  assignments.forEach((assignment) => {
    const contact = contactByApplicationId.get(assignment.applicantId)?.trim()
    const startsAt = toInstant(dateKey, assignment.slotStart)
    if (!contact || startsAt == null) {
      result.skipped.push(assignment.applicantId)
      return
    }

    result.assignments.push({
      applicationId: Number(assignment.applicantId),
      sessionId: Number(assignment.sessionId),
      startsAt,
      contactSnapshot: contact,
    })
  })

  return result
}
