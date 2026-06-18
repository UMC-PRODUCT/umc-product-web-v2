import { useMemo } from "react"

import { cn } from "@/shared/lib/utils"

import { shortenSchoolName, toRoundNumber } from "../model/mappers"
import { ApplicationTableSection } from "./ApplicationTableSection"
import { ChallengerStatsSection } from "./ChallengerStatsSection"

import type { ProjectStatisticsResponse } from "../model/apiTypes"
import type { ChallengerStats, ProjectApplication } from "../model/types"

interface ChallengerApplicationViewProps {
  projects: ProjectApplication[]
  availablePerRound?: Map<number, number>
  projectStats?: ProjectStatisticsResponse[]
  schoolIdToName?: Map<string, string>
  currentRound?: number
  decisionDeadlineByRound?: Map<number, number>
  className?: string
}

// 프로젝트 데이터에서 PM 통계 계산
function computeStats(
  projects: ProjectApplication[],
  availablePerRound?: Map<number, number>,
  projectStats?: ProjectStatisticsResponse[],
  schoolIdToName?: Map<string, string>,
  currentRound?: number,
): ChallengerStats {
  const firstStat = projectStats?.[0]

  // 서버 통계가 있으면 직접 사용
  if (firstStat) {
    const rounds = firstStat.roundApplicationStatistics
      .map((r) => ({
        round: toRoundNumber(r.matchingRound.phase),
        applied: Number(r.appliedMemberCount),
        total: Number(r.availableMemberCount),
      }))
      .sort((a, b) => a.round - b.round)

    // 현재 차수 학교별 지원자 수 (상위 5개)
    const targetPhase =
      currentRound === 1
        ? "FIRST"
        : currentRound === 2
          ? "SECOND"
          : currentRound === 3
            ? "THIRD"
            : "FIRST"
    const targetSchools = firstStat.schoolApplicationStatistics.find(
      (s) => s.matchingRound.phase === targetPhase,
    )
    const universities = (targetSchools?.schools ?? [])
      .map((s) => ({
        name: shortenSchoolName(schoolIdToName?.get(s.schoolId) ?? s.schoolId),
        count: Number(s.applicantCount),
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    // 현재 차수 기준 지원률
    const targetRound = rounds.find((r) => r.round === (currentRound ?? 1))
    const totalApplicants = targetRound?.applied ?? 0
    const available = targetRound?.total ?? 0
    const completionRate =
      available > 0 ? Math.round((totalApplicants / available) * 100) : 0

    return { completionRate, rounds, universities, totalApplicants }
  }

  // 폴백: 서버 통계 없을 때 FE 재집계
  const allApplicants = projects.flatMap((p) => p.applicants)

  const totalQuota = projects.reduce(
    (sum, p) => sum + p.designCount.total + p.feCount.total + p.beCount.total,
    0,
  )

  const roundMap = new Map<number, number>()
  for (const a of allApplicants) {
    roundMap.set(a.round, (roundMap.get(a.round) ?? 0) + 1)
  }

  const rounds = Array.from(roundMap.entries())
    .sort(([a], [b]) => a - b)
    .map(([round, applied]) => ({
      round,
      applied,
      total: availablePerRound?.get(round) ?? totalQuota,
    }))

  const uniMap = new Map<string, number>()
  for (const a of allApplicants) {
    uniMap.set(a.university, (uniMap.get(a.university) ?? 0) + 1)
  }
  const universities = Array.from(uniMap.entries())
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([name, count]) => ({ name, count }))

  const available = availablePerRound?.values().next().value ?? totalQuota
  const completionRate =
    available > 0 ? Math.round((allApplicants.length / available) * 100) : 0

  return {
    completionRate,
    rounds,
    universities,
    totalApplicants: allApplicants.length,
  }
}

export function ChallengerApplicationView({
  projects,
  availablePerRound,
  projectStats,
  schoolIdToName,
  currentRound,
  decisionDeadlineByRound,
  className,
}: ChallengerApplicationViewProps) {
  const stats = useMemo(
    () =>
      computeStats(
        projects,
        availablePerRound,
        projectStats,
        schoolIdToName,
        currentRound,
      ),
    [projects, availablePerRound, projectStats, schoolIdToName, currentRound],
  )

  return (
    <div className={cn("flex flex-col gap-14.25 pl-4", className)}>
      <ChallengerStatsSection stats={stats} currentRound={currentRound} />
      <ApplicationTableSection
        projects={projects}
        searchPlaceholder="닉네임/이름으로 검색하세요."
        visibleFilters={["part", "school"]}
        currentRound={currentRound}
        decisionDeadlineByRound={decisionDeadlineByRound}
        hidePendingStatus
      />
    </div>
  )
}
