import { describe, expect, it } from "vitest"

import { matchingResponseToStats } from "./matchingStatsMapper"

import type {
  ChapterMatchingStatisticsResponse,
  RoundMatchingStat,
} from "@/features/application/model/apiTypes"

function round(
  phase: RoundMatchingStat["matchingRound"]["phase"],
  matched: number,
  available: number,
  projects: Array<[number, number]>,
): RoundMatchingStat {
  return {
    matchingRound: { matchingRoundId: "1", type: "PLAN_DEVELOPER", phase },
    matchedMemberCount: String(matched),
    availableMemberCount: String(available),
    projects: projects.map(([projectId, count]) => ({
      projectId: String(projectId),
      matchedMemberCount: String(count),
    })),
  }
}

const projectIdToName = new Map([
  ["10", "프로젝트 A"],
  ["11", "프로젝트 B"],
])
const schoolIdToName = new Map([
  ["1", "동국대학교"],
  ["2", "건국대학교"],
])

describe("matchingResponseToStats", () => {
  it("matched > 0인 차수만 rounds에 포함하고 차수 오름차순 정렬한다", () => {
    const response: ChapterMatchingStatisticsResponse = {
      chapterId: "3",
      roundMatchingStatistics: [
        round("SECOND", 0, 4, [[10, 0]]),
        round("FIRST", 3, 4, [[10, 2], [11, 1]]),
      ],
      schoolMatchingStatistics: [
        { schoolId: "1", matchedMemberCount: "2", totalMemberCount: "5" },
      ],
      unclassifiedMatchingStatistics: { matchedMemberCount: "0", projects: [] },
    }

    const { stats } = matchingResponseToStats(
      response,
      projectIdToName,
      schoolIdToName,
    )

    expect(stats.rounds).toEqual([{ round: 1, applied: 3, total: 5 }])
  })

  it("학교별 집계로 총원/완료/완료율을 계산한다 (unclassified는 학교 집계에 이미 포함)", () => {
    const response: ChapterMatchingStatisticsResponse = {
      chapterId: "3",
      roundMatchingStatistics: [round("FIRST", 2, 10, [[10, 2]])],
      schoolMatchingStatistics: [
        { schoolId: "1", matchedMemberCount: "2", totalMemberCount: "6" },
        { schoolId: "2", matchedMemberCount: "1", totalMemberCount: "4" },
      ],
      unclassifiedMatchingStatistics: {
        matchedMemberCount: "1",
        projects: [[10, 1]].map(([p, c]) => ({
          projectId: String(p),
          matchedMemberCount: String(c),
        })),
      },
    }

    const { stats } = matchingResponseToStats(
      response,
      projectIdToName,
      schoolIdToName,
    )

    expect(stats.totalMembers).toBe(10)
    expect(stats.completedCount).toBe(3)
    expect(stats.pendingCount).toBe(7)
    expect(stats.completionRate).toBe(30)
  })

  it("currentRound는 matched > 0인 최대 차수이고 round->project를 피벗한다", () => {
    const response: ChapterMatchingStatisticsResponse = {
      chapterId: "3",
      roundMatchingStatistics: [
        round("FIRST", 3, 4, [[10, 2], [11, 1]]),
        round("SECOND", 2, 4, [[10, 1], [11, 1]]),
      ],
      schoolMatchingStatistics: [
        { schoolId: "1", matchedMemberCount: "5", totalMemberCount: "8" },
      ],
      unclassifiedMatchingStatistics: { matchedMemberCount: "0", projects: [] },
    }

    const { stats, currentRound } = matchingResponseToStats(
      response,
      projectIdToName,
      schoolIdToName,
    )

    expect(currentRound).toBe(2)
    expect(stats.projectRounds).toEqual([
      { name: "프로젝트 A", rounds: [2, 1, 0] },
      { name: "프로젝트 B", rounds: [1, 1, 0] },
    ])
  })

  it("Top4는 currentRound 기준으로 매칭 수 내림차순 정렬한다", () => {
    const response: ChapterMatchingStatisticsResponse = {
      chapterId: "3",
      roundMatchingStatistics: [
        round("FIRST", 3, 4, [[10, 1], [11, 2]]),
      ],
      schoolMatchingStatistics: [
        { schoolId: "1", matchedMemberCount: "3", totalMemberCount: "8" },
      ],
      unclassifiedMatchingStatistics: { matchedMemberCount: "0", projects: [] },
    }

    const { stats } = matchingResponseToStats(
      response,
      projectIdToName,
      schoolIdToName,
    )

    expect(stats.topProjects).toEqual([
      { projectId: "11", name: "프로젝트 B", count: 2 },
      { projectId: "10", name: "프로젝트 A", count: 1 },
    ])
  })

  it("학교명을 단축 표기로 매핑하고 매칭 수 내림차순 top5로 자른다", () => {
    const response: ChapterMatchingStatisticsResponse = {
      chapterId: "3",
      roundMatchingStatistics: [round("FIRST", 3, 4, [[10, 3]])],
      schoolMatchingStatistics: [
        { schoolId: "1", matchedMemberCount: "1", totalMemberCount: "5" },
        { schoolId: "2", matchedMemberCount: "2", totalMemberCount: "5" },
      ],
      unclassifiedMatchingStatistics: { matchedMemberCount: "0", projects: [] },
    }

    const { stats } = matchingResponseToStats(
      response,
      projectIdToName,
      schoolIdToName,
    )

    expect(stats.universities).toEqual([
      { name: "건국대", applied: 2, total: 5 },
      { name: "동국대", applied: 1, total: 5 },
    ])
  })
})
