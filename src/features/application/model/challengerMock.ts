import type { RoundCount } from "./types"

export interface ChallengerProjectInfo {
  projectName: string
  pmName: string
  pmUniversity: string
  thumbnailUrl?: string
}

export interface UniversityApplicant {
  name: string
  count: number
}

export interface ChallengerStats {
  completionRate: number
  rounds: RoundCount[]
  universities: UniversityApplicant[]
  totalApplicants: number
}

export const MOCK_CHALLENGER_PROJECT: ChallengerProjectInfo = {
  projectName: "UMC Web",
  pmName: "벨라/황지원",
  pmUniversity: "중앙대",
}

export const MOCK_CHALLENGER_STATS: ChallengerStats = {
  completionRate: 48,
  rounds: [
    { round: 1, applied: 17, total: 100 },
    { round: 2, applied: 6, total: 58 },
    { round: 3, applied: 2, total: 30 },
  ],
  universities: [
    { name: "한양대\nERICA", count: 10 },
    { name: "숭실대", count: 7 },
    { name: "성신여대", count: 4 },
    { name: "안양대", count: 1 },
    { name: "서경대", count: 0 },
  ],
  totalApplicants: 12,
}
