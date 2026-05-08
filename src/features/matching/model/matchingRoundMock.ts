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
  roundLabel: string
  title: string
  startDate: string
  endDate: string
  startTime: string
  endTime: string
}

export const MOCK_ROUND_SCHEDULES: RoundSchedule[] = [
  {
    roundLabel: "1차",
    title: "Plan-Design 매칭",
    startDate: "2026-05-07",
    endDate: "2026-05-07",
    startTime: "00:00",
    endTime: "23:59",
  },
  {
    roundLabel: "2차",
    title: "Plan-Develop 매칭",
    startDate: "2026-05-12",
    endDate: "2026-05-12",
    startTime: "12:00",
    endTime: "23:59",
  },
  {
    roundLabel: "3차",
    title: "Plan-Design 매칭",
    startDate: "2026-05-13",
    endDate: "2026-05-13",
    startTime: "12:00",
    endTime: "23:59",
  },
  {
    roundLabel: "랜덤",
    title: "Plan-Design 매칭",
    startDate: "2027-01-02",
    endDate: "2027-01-02",
    startTime: "00:00",
    endTime: "23:59",
  },
]
