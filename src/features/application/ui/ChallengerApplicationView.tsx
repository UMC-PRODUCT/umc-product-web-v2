import { useMemo } from "react"

import { cn } from "@/shared/lib/utils"

import { ApplicationTableSection } from "./ApplicationTableSection"
import { ChallengerStatsSection } from "./ChallengerStatsSection"

import type { ChallengerStats, ProjectApplication } from "../model/types"

interface ChallengerApplicationViewProps {
  projects: ProjectApplication[]
  currentRound?: number
  className?: string
}

// 프로젝트 데이터에서 PM 통계 계산
function computeStats(projects: ProjectApplication[]): ChallengerStats {
  const allApplicants = projects.flatMap((p) => p.applicants)

  // 지원 가용자 = 전체 파트 quota 합산
  const totalQuota = projects.reduce(
    (sum, p) => sum + p.designCount.total + p.feCount.total + p.beCount.total,
    0,
  )

  // 차수별 지원자 수 집계
  const roundMap = new Map<number, number>()
  for (const a of allApplicants) {
    roundMap.set(a.round, (roundMap.get(a.round) ?? 0) + 1)
  }

  const rounds = Array.from(roundMap.entries())
    .sort(([a], [b]) => a - b)
    .map(([round, applied]) => ({
      round,
      applied,
      total: totalQuota,
    }))

  // 대학별 지원자 수 (상위 5개)
  const uniMap = new Map<string, number>()
  for (const a of allApplicants) {
    uniMap.set(a.university, (uniMap.get(a.university) ?? 0) + 1)
  }
  const universities = Array.from(uniMap.entries())
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([name, count]) => ({ name, count }))

  // 지원률 = 지원자 / 지원 가용자
  const completionRate =
    totalQuota > 0 ? Math.round((allApplicants.length / totalQuota) * 100) : 0

  return {
    completionRate,
    rounds,
    universities,
    totalApplicants: allApplicants.length,
  }
}

export function ChallengerApplicationView({
  projects,
  currentRound,
  className,
}: ChallengerApplicationViewProps) {
  const stats = useMemo(() => computeStats(projects), [projects])

  return (
    <div className={cn("flex flex-col gap-14.25 pl-4", className)}>
      <ChallengerStatsSection stats={stats} />
      <ApplicationTableSection
        projects={projects}
        searchPlaceholder="닉네임/이름으로 검색하세요."
        visibleFilters={["part", "school"]}
        currentRound={currentRound}
        hidePendingStatus
      />
    </div>
  )
}
