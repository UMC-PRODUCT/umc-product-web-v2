import type { RecruitingStatus } from "@/shared/model/recruitingStatus"

const DAY_MS = 24 * 60 * 60 * 1000

export interface RecruitingPeriod {
  documentStartAt?: string | null
  documentEndAt?: string | null
  applicationOpen?: boolean
}

/** 남은 일수. 같은 날이면 0, 지났으면 음수. */
function daysUntil(target: number, now: number): number {
  return Math.ceil((target - now) / DAY_MS)
}

/**
 * 여러 차수 중 헤더에 띄울 하나를 고르고 상태를 만든다.
 *
 * 열려 있는 차수가 있으면 그중 가장 먼저 마감하는 것을 쓴다. 마감이 임박한 쪽을
 * 보여줘야 지원자가 놓치지 않는다.
 * 열린 게 없으면 가장 먼저 시작하는 예정 차수를, 그것도 없으면 마감으로 본다.
 */
export function resolveRecruitingStatus(
  periods: readonly RecruitingPeriod[],
  now: number,
): RecruitingStatus | undefined {
  if (periods.length === 0) return undefined

  const openEnds: number[] = []
  const upcomingStarts: number[] = []

  for (const period of periods) {
    const start = period.documentStartAt
      ? Date.parse(period.documentStartAt)
      : NaN
    const end = period.documentEndAt ? Date.parse(period.documentEndAt) : NaN

    if (Number.isFinite(end) && end > now && period.applicationOpen) {
      openEnds.push(end)
      continue
    }
    if (Number.isFinite(start) && start > now) {
      upcomingStarts.push(start)
    }
  }

  if (openEnds.length > 0) {
    return { phase: "open", dDay: daysUntil(Math.min(...openEnds), now) }
  }
  if (upcomingStarts.length > 0) {
    return {
      phase: "before",
      dDay: daysUntil(Math.min(...upcomingStarts), now),
    }
  }
  return { phase: "closed" }
}
