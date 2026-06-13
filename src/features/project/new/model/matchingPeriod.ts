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
