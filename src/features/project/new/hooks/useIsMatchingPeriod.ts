import { useQuery } from "@tanstack/react-query"
import { useEffect, useMemo, useState } from "react"

import { getMatchingRounds } from "@/features/application/api/applicationApi"
import { applicationKeys } from "@/features/application/api/applicationKeys"
import { useMe } from "@/features/auth/hooks/useMe"
import { getLatestChallengerRecord } from "@/features/auth/model/identity"

import {
  getNextMatchingBoundary,
  isWithinMatchingPeriod,
} from "../model/matchingPeriod"

const MAX_TIMER_DELAY_MS = 24 * 60 * 60 * 1000
const BOUNDARY_PASS_MS = 50

interface UseIsMatchingPeriodOptions {
  chapterId?: number
  enabled?: boolean
}

export function useIsMatchingPeriod(options?: UseIsMatchingPeriodOptions) {
  const { data: me } = useMe()
  const fallbackChapterId = getLatestChallengerRecord(me)?.chapterId
    ? Number(getLatestChallengerRecord(me)!.chapterId)
    : undefined
  const chapterId =
    options && "chapterId" in options ? options.chapterId : fallbackChapterId
  const enabled = (options?.enabled ?? true) && chapterId !== undefined

  const { data: rounds, isSuccess } = useQuery({
    queryKey: applicationKeys.matchingRounds(chapterId),
    queryFn: () => getMatchingRounds(chapterId),
    enabled: enabled && chapterId !== undefined,
  })

  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    if (!isSuccess) return
    const boundary = getNextMatchingBoundary(rounds, now)
    if (!boundary) return
    const delay = Math.min(
      Math.max(0, boundary.getTime() - now.getTime()) + BOUNDARY_PASS_MS,
      MAX_TIMER_DELAY_MS,
    )
    const timer = setTimeout(() => setNow(new Date()), delay)
    return () => clearTimeout(timer)
  }, [isSuccess, rounds, now])

  return useMemo(
    () => (isSuccess ? isWithinMatchingPeriod(rounds, now) : false),
    [isSuccess, rounds, now],
  )
}
