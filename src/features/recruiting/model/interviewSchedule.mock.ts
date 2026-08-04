import type { InterviewApplicant, InterviewSession } from "./interviewSchedule"

export interface InterviewScheduleRound {
  roundId: string
  schoolName: string
  roundTitle: string
  documentClosedLabel: string
  interviewStartAt: string
  interviewEndAt: string
  assignedCount: number
  totalCount: number
}

export const INTERVIEW_SCHEDULE_ROUNDS_MOCK: InterviewScheduleRound[] = [
  {
    roundId: "round-1",
    schoolName: "한양대학교 ERICA",
    roundTitle: "한양대학교 ERICA UMC 11기 정규 모집",
    documentClosedLabel: "서류 지원 마감",
    interviewStartAt: "2026-07-18T10:00:00",
    interviewEndAt: "2026-07-26T23:59:00",
    assignedCount: 26,
    totalCount: 42,
  },
]

export const INTERVIEW_SESSIONS_MOCK: InterviewSession[] = [
  {
    id: "session-1",
    name: "디자인 파트 면접 (담당자: 이예원)",
    startTime: "10:00",
    endTime: "15:00",
    mode: "online",
    place: "https://meet.example.com/umc-design",
  },
  {
    id: "session-2",
    name: "면접 B",
    startTime: "10:00",
    endTime: "15:00",
    mode: "offline",
    place: "한국대학교 유엠관 107호",
  },
]

export const INTERVIEW_APPLICANTS_MOCK: InterviewApplicant[] = [
  {
    id: "applicant-1",
    name: "이예원",
    availabilities: ["10:00~12:00", "13:00~15:00"],
  },
  {
    id: "applicant-2",
    name: "이예원원",
    availabilities: ["10:30~11:30", "14:00~15:00"],
  },
  { id: "applicant-3", name: "황지원", availabilities: ["11:00~13:00"] },
  { id: "applicant-4", name: "강지훈", availabilities: ["10:00~11:00"] },
  { id: "applicant-5", name: "한현서", availabilities: ["12:00~14:00"] },
  { id: "applicant-6", name: "양혜원", availabilities: ["13:30~15:00"] },
  { id: "applicant-7", name: "오창준", availabilities: ["10:00~10:30"] },
  { id: "applicant-8", name: "박세은", availabilities: ["11:30~13:30"] },
  { id: "applicant-9", name: "권도희", availabilities: ["14:30~15:00"] },
  { id: "applicant-10", name: "박승범", availabilities: ["10:00~15:00"] },
]
