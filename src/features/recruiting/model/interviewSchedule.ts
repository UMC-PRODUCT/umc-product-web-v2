import type {
  RecruitingRoundGroup,
  RecruitingStatusSummary,
} from "../api/types"

export type InterviewMode = "online" | "offline"

export interface InterviewScheduleRound {
  roundId: string
  schoolName: string
  roundTitle: string
  documentClosedLabel: string
  interviewStartAt: string
  interviewEndAt: string
  assignedCount?: number
  totalCount?: number
}

export interface InterviewSession {
  id: string
  name: string
  startTime: string
  endTime: string
  mode: InterviewMode
  place: string
}

export interface InterviewApplicant {
  id: string
  name: string
  availabilities: string[]
}

export interface SlotAssignment {
  sessionId: string
  slotStart: string
  applicantId: string
}

function createRoundStatusMap(summary: RecruitingStatusSummary | undefined) {
  const statusMap = new Map<
    string,
    { assignedCount: number; totalCount: number }
  >()

  for (const school of summary?.schools ?? []) {
    for (const round of school.rounds) {
      statusMap.set(round.roundId, {
        assignedCount: round.countByStatus.INTERVIEW_ASSIGNED ?? 0,
        totalCount: round.totalCount,
      })
    }
  }

  return statusMap
}

export function toInterviewScheduleRounds(
  groups: RecruitingRoundGroup[],
  summary?: RecruitingStatusSummary,
): InterviewScheduleRound[] {
  const statusMap = createRoundStatusMap(summary)

  return groups.flatMap((group) =>
    group.rounds.flatMap((round) => {
      if (
        round.status === "DRAFT" ||
        !round.interviewRequired ||
        !round.interviewStartAt ||
        !round.interviewEndAt
      ) {
        return []
      }

      const status = statusMap.get(round.roundId)
      return [
        {
          roundId: round.roundId,
          schoolName: group.schoolName,
          roundTitle: round.title,
          documentClosedLabel: "서류 지원 마감",
          interviewStartAt: round.interviewStartAt,
          interviewEndAt: round.interviewEndAt,
          assignedCount: status?.assignedCount,
          totalCount: status?.totalCount,
        },
      ]
    }),
  )
}

export function isInterviewApplicant(
  value: unknown,
): value is InterviewApplicant {
  return (
    typeof value === "object" &&
    value !== null &&
    "id" in value &&
    typeof value.id === "string" &&
    "name" in value &&
    typeof value.name === "string" &&
    "availabilities" in value &&
    Array.isArray(value.availabilities)
  )
}

export function toMinutes(time: string): number | null {
  const matched = /^(\d{1,2}):(\d{2})$/.exec(time.trim())
  if (!matched) return null
  const hours = Number(matched[1])
  const minutes = Number(matched[2])
  if (hours > 23 || minutes > 59) return null
  return hours * 60 + minutes
}

function toDateKey(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

// 면접 기간의 날짜를 하루 단위로 펼쳐 날짜 탭을 만든다. 시각 부분은 버린다.
export function resolveScheduleDates(
  interviewStartAt: string | undefined,
  interviewEndAt: string | undefined,
): string[] {
  if (!interviewStartAt || !interviewEndAt) return []
  const start = new Date(interviewStartAt)
  const end = new Date(interviewEndAt)
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return []

  const cursor = new Date(
    start.getFullYear(),
    start.getMonth(),
    start.getDate(),
  )
  const last = new Date(end.getFullYear(), end.getMonth(), end.getDate())
  if (cursor > last) return []

  const dates: string[] = []
  while (cursor <= last) {
    dates.push(toDateKey(cursor))
    cursor.setDate(cursor.getDate() + 1)
  }
  return dates
}

export function formatDateTabLabel(dateKey: string): string {
  const matched = /^\d{4}-(\d{2})-(\d{2})$/.exec(dateKey)
  if (!matched) return dateKey
  return `${Number(matched[1])}월 ${Number(matched[2])}일`
}

export function toSlotKey(sessionId: string, slotStart: string): string {
  return `${sessionId}__${slotStart}`
}

export function parseSlotKey(
  slotKey: string,
): { sessionId: string; slotStart: string } | null {
  const index = slotKey.lastIndexOf("__")
  if (index <= 0) return null
  return {
    sessionId: slotKey.slice(0, index),
    slotStart: slotKey.slice(index + 2),
  }
}

export function findAssignment(
  assignments: SlotAssignment[],
  sessionId: string,
  slotStart: string,
): SlotAssignment | undefined {
  return assignments.find(
    (assignment) =>
      assignment.sessionId === sessionId && assignment.slotStart === slotStart,
  )
}

// 한 지원자는 한 슬롯에만, 한 슬롯에는 한 명만 들어간다. 옮겨 놓는 동작이므로
// 지원자의 기존 배정과 대상 슬롯의 기존 배정을 모두 걷어낸 뒤 넣는다.
export function assignApplicant(
  assignments: SlotAssignment[],
  sessionId: string,
  slotStart: string,
  applicantId: string,
): SlotAssignment[] {
  const kept = assignments.filter(
    (assignment) =>
      assignment.applicantId !== applicantId &&
      !(
        assignment.sessionId === sessionId && assignment.slotStart === slotStart
      ),
  )
  return [...kept, { sessionId, slotStart, applicantId }]
}

export function unassignApplicant(
  assignments: SlotAssignment[],
  applicantId: string,
): SlotAssignment[] {
  return assignments.filter(
    (assignment) => assignment.applicantId !== applicantId,
  )
}

export function splitApplicantsByAssignment(
  applicants: InterviewApplicant[],
  assignments: SlotAssignment[],
) {
  const assignedIds = new Set(
    assignments.map((assignment) => assignment.applicantId),
  )
  return {
    waiting: applicants.filter((applicant) => !assignedIds.has(applicant.id)),
    assigned: applicants.filter((applicant) => assignedIds.has(applicant.id)),
  }
}

export function calcAllocationRate(
  assignedCount: number,
  totalCount: number,
): number {
  if (totalCount <= 0) return 0
  return Math.round((assignedCount / totalCount) * 100)
}
