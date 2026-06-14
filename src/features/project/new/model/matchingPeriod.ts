import dayjs from "dayjs"

import type { MatchingRoundResponse } from "@/features/application/model/apiTypes"

export function isWithinMatchingPeriod(
  rounds: MatchingRoundResponse[] | undefined,
  now: Date,
): boolean {
  if (!rounds?.length) return false
  const current = dayjs(now)
  return rounds.some((round) => {
    if (!round.startsAt || !round.endsAt) return false
    const start = dayjs(round.startsAt)
    const end = dayjs(round.endsAt)
    return !current.isBefore(start) && !current.isAfter(end)
  })
}

export function getNextMatchingBoundary(
  rounds: MatchingRoundResponse[] | undefined,
  now: Date,
): Date | null {
  if (!rounds?.length) return null
  const currentMs = now.getTime()
  let nextMs: number | null = null
  for (const round of rounds) {
    for (const ts of [round.startsAt, round.endsAt]) {
      if (!ts) continue
      const ms = dayjs(ts).valueOf()
      if (!Number.isFinite(ms) || ms < currentMs) continue
      if (nextMs === null || ms < nextMs) nextMs = ms
    }
  }
  return nextMs === null ? null : new Date(nextMs)
}
