import type {
  MatchingPhase,
  MatchingRoundResponse,
  MatchingType as ServerMatchingType,
} from "@/features/application/model/apiTypes"

export const MATCHING_TYPES = ["Plan-Design 매칭", "Plan-Develop 매칭"] as const

export type MatchingType = (typeof MATCHING_TYPES)[number]

export const BRANCHES = [
  "Chromium",
  "Ferrum",
  "Neon",
  "Platinum",
  "Selenium",
  "Xenon",
] as const

export type Branch = (typeof BRANCHES)[number]

export interface RoundSchedule {
  id?: number
  phase: MatchingPhase
  roundLabel: string
  title: string
  startDate: string
  endDate: string
  startTime: string
  endTime: string
}

// UI 매칭 타입 <-> 서버 타입 변환
const UI_TO_SERVER_TYPE: Record<MatchingType, ServerMatchingType> = {
  "Plan-Design 매칭": "PLAN_DESIGN",
  "Plan-Develop 매칭": "PLAN_DEVELOPER",
}

const SERVER_TO_UI_TYPE: Record<ServerMatchingType, MatchingType> = {
  PLAN_DESIGN: "Plan-Design 매칭",
  PLAN_DEVELOPER: "Plan-Develop 매칭",
}

export function toServerMatchingType(ui: MatchingType): ServerMatchingType {
  return UI_TO_SERVER_TYPE[ui]
}

export function toUIMatchingType(server: ServerMatchingType): MatchingType {
  return SERVER_TO_UI_TYPE[server]
}

// phase <-> 라벨 변환
const PHASE_LABEL: Record<MatchingPhase, string> = {
  FIRST: "1차",
  SECOND: "2차",
  THIRD: "3차",
}

export const PHASES: MatchingPhase[] = ["FIRST", "SECOND", "THIRD"]

// 서버 ISO datetime -> UI date + time 분리
function parseServerDatetime(iso: string): { date: string; time: string } {
  const dt = new Date(iso)
  const y = dt.getFullYear()
  const m = String(dt.getMonth() + 1).padStart(2, "0")
  const d = String(dt.getDate()).padStart(2, "0")
  const hh = String(dt.getHours()).padStart(2, "0")
  const mm = String(dt.getMinutes()).padStart(2, "0")
  return { date: `${y}-${m}-${d}`, time: `${hh}:${mm}` }
}

// UI date + time -> ISO datetime 문자열 (로컬 시간 -> UTC 변환, 초:밀리초는 59:999 고정)
export function toISODatetime(date: string, time: string): string {
  const dt = new Date(`${date}T${time}:59.999`)
  return dt.toISOString()
}

// 서버 응답 -> RoundSchedule 변환
export function toRoundSchedule(r: MatchingRoundResponse): RoundSchedule {
  const start = parseServerDatetime(r.startsAt)
  const end = parseServerDatetime(r.endsAt)
  return {
    id: Number(r.id),
    phase: r.phase,
    roundLabel: PHASE_LABEL[r.phase],
    title: toUIMatchingType(r.type),
    startDate: start.date,
    endDate: end.date,
    startTime: start.time,
    endTime: end.time,
  }
}

// 특정 타입의 라운드가 없을 때 빈 3개 차수 생성
// 1차: 시작 00:00 / 2차·3차: 시작 12:00, 종료 23:59 고정
export function emptyRoundSchedules(
  matchingType: MatchingType,
): RoundSchedule[] {
  return PHASES.map((phase) => ({
    phase,
    roundLabel: PHASE_LABEL[phase],
    title: matchingType,
    startDate: "",
    endDate: "",
    startTime: phase === "FIRST" ? "00:00" : "12:00",
    endTime: "23:59",
  }))
}
