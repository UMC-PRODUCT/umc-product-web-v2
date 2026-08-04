export type InterviewMode = "online" | "offline"

export interface InterviewSession {
  id: string
  name: string
  startTime: string
  endTime: string
  mode: InterviewMode
  place: string
}

export interface InterviewTimeSlot {
  start: string
  end: string
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

export const SLOT_STEP_MINUTES = 30

export function toMinutes(time: string): number | null {
  const matched = /^(\d{1,2}):(\d{2})$/.exec(time.trim())
  if (!matched) return null
  const hours = Number(matched[1])
  const minutes = Number(matched[2])
  if (hours > 23 || minutes > 59) return null
  return hours * 60 + minutes
}

// 하루의 마지막 시각. 이 값을 넘기면 toMinutes 가 되읽지 못해 슬롯 계산이
// 통째로 무너진다.
export const MAX_MINUTES_OF_DAY = 23 * 60 + 59

export function toTimeLabel(minutes: number): string {
  const clamped = Math.min(Math.max(minutes, 0), MAX_MINUTES_OF_DAY)
  const hours = Math.floor(clamped / 60)
  const rest = clamped % 60
  return `${String(hours).padStart(2, "0")}:${String(rest).padStart(2, "0")}`
}

// 슬롯을 하나 더 붙일 수 있는지. 마지막 슬롯이 자정을 넘기면 안 된다.
export function canExtendEndTime(
  endTime: string,
  stepMinutes: number = SLOT_STEP_MINUTES,
): boolean {
  const end = toMinutes(endTime)
  return end != null && end + stepMinutes <= MAX_MINUTES_OF_DAY
}

// 시안의 슬롯은 항상 30분 단위다. 끝시각에 걸쳐 30분을 채우지 못하는 구간은
// 면접을 배정할 수 없으므로 만들지 않는다.
export function buildTimeSlots(
  startTime: string,
  endTime: string,
  stepMinutes: number = SLOT_STEP_MINUTES,
): InterviewTimeSlot[] {
  const start = toMinutes(startTime)
  const end = toMinutes(endTime)
  if (start == null || end == null || stepMinutes <= 0) return []

  const slots: InterviewTimeSlot[] = []
  for (let cursor = start; cursor + stepMinutes <= end; cursor += stepMinutes) {
    slots.push({
      start: toTimeLabel(cursor),
      end: toTimeLabel(cursor + stepMinutes),
    })
  }
  return slots
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

export function createEmptySession(index: number): InterviewSession {
  return {
    id: `session-${index}`,
    name: "",
    startTime: "",
    endTime: "",
    mode: "online",
    place: "",
  }
}

export function isSessionComplete(session: InterviewSession): boolean {
  const start = toMinutes(session.startTime)
  const end = toMinutes(session.endTime)
  return (
    session.name.trim().length > 0 &&
    start != null &&
    end != null &&
    start < end &&
    session.place.trim().length > 0
  )
}
