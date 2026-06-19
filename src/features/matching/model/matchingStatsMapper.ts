// 매칭 현황 집계(PROJECT-STAT-003) 응답 -> ApplicationStats 변환
// summaryToStats(지원 현황과 공유)와 완전히 독립. ProjectMember 기준 매칭 집계만 사용.

import { shortenSchoolName, toRoundNumber } from "@/features/application/model/mappers"

import type { ChapterMatchingStatisticsResponse } from "@/features/application/model/apiTypes"
import type {
  ApplicationStats,
  ProjectRoundData,
  TopProject,
  UniversityCount,
} from "@/features/application/model/types"

const PHASE_BY_ROUND: Record<number, "FIRST" | "SECOND" | "THIRD"> = {
  1: "FIRST",
  2: "SECOND",
  3: "THIRD",
}

// 서버가 chapterId로 지부 스코핑하므로 FE 필터링 없이 그대로 집계
export function matchingResponseToStats(
  response: ChapterMatchingStatisticsResponse,
  projectIdToName: Map<string, string>,
  schoolIdToName: Map<string, string>,
): { stats: ApplicationStats; currentRound: number | undefined } {
  const schoolStats = response.schoolMatchingStatistics

  // 총원 / 매칭 완료 (학교별 집계 합산, unclassified 포함)
  const totalMembers = schoolStats.reduce(
    (sum, s) => sum + Number(s.totalMemberCount),
    0,
  )
  const completedCount = schoolStats.reduce(
    (sum, s) => sum + Number(s.matchedMemberCount),
    0,
  )
  const pendingCount = Math.max(0, totalMembers - completedCount)
  const completionRate =
    totalMembers > 0 ? Math.round((completedCount / totalMembers) * 100) : 0

  // 차수별 매칭 (matched > 0인 차수만, 도넛 분모는 지부 총원으로 보정)
  const rounds = response.roundMatchingStatistics
    .map((r) => ({
      round: toRoundNumber(r.matchingRound.phase),
      applied: Number(r.matchedMemberCount),
      total: totalMembers,
    }))
    .filter((r) => r.applied > 0)
    .sort((a, b) => a.round - b.round)

  // 노출된(matched > 0) 최대 차수
  const currentRound =
    rounds.length > 0 ? Math.max(...rounds.map((r) => r.round)) : undefined

  // Top 4 (3차 이후에는 1차 기준 유지)
  const topRound =
    currentRound === undefined ? undefined : currentRound >= 3 ? 1 : currentRound
  const topPhase = topRound === undefined ? undefined : PHASE_BY_ROUND[topRound]
  const topRoundStat = topPhase
    ? response.roundMatchingStatistics.find(
        (r) => r.matchingRound.phase === topPhase,
      )
    : undefined
  const topProjects: TopProject[] = (topRoundStat?.projects ?? [])
    .map((p) => ({
      projectId: p.projectId,
      name: projectIdToName.get(String(p.projectId)) ?? String(p.projectId),
      count: Number(p.matchedMemberCount),
    }))
    .sort(
      (a, b) => b.count - a.count || Number(a.projectId) - Number(b.projectId),
    )
    .slice(0, 4)

  // 프로젝트별 차수별 매칭 (round -> projects 구조를 project -> [1차,2차,3차]로 피벗)
  const projectRoundMap = new Map<string, number[]>()
  for (const r of response.roundMatchingStatistics) {
    const idx = toRoundNumber(r.matchingRound.phase) - 1
    if (idx < 0 || idx > 2) continue
    for (const p of r.projects) {
      const key = String(p.projectId)
      const arr = projectRoundMap.get(key) ?? [0, 0, 0]
      arr[idx] = Number(p.matchedMemberCount)
      projectRoundMap.set(key, arr)
    }
  }
  const projectRounds: ProjectRoundData[] = [...projectRoundMap.entries()].map(
    ([projectId, roundCounts]) => ({
      name: projectIdToName.get(projectId) ?? projectId,
      rounds: roundCounts,
    }),
  )

  // 학교별 매칭 완료 / 총원 (top 5)
  const universities: UniversityCount[] = schoolStats
    .map((s) => ({
      name: shortenSchoolName(
        schoolIdToName.get(String(s.schoolId)) ?? String(s.schoolId),
      ),
      applied: Number(s.matchedMemberCount),
      total: Number(s.totalMemberCount),
    }))
    .sort((a, b) => b.applied - a.applied)
    .slice(0, 5)

  return {
    stats: {
      totalMembers,
      completionRate,
      completedCount,
      pendingCount,
      rounds,
      topProjects,
      universities,
      projectRounds,
    },
    currentRound,
  }
}
