import { useQuery } from "@tanstack/react-query"
import { useMemo } from "react"

import { getMatchingRounds } from "@/features/application/api/applicationApi"
import { applicationKeys } from "@/features/application/api/applicationKeys"
import { useMe } from "@/features/auth/hooks/useMe"
import { getLatestChallengerRecord } from "@/features/auth/model/identity"

import { isWithinMatchingPeriod } from "../model/matchingPeriod"

export function useIsMatchingPeriod() {
  const { data: me } = useMe()
  const chapterId = getLatestChallengerRecord(me)?.chapterId
    ? Number(getLatestChallengerRecord(me)!.chapterId)
    : undefined

  const { data: rounds, isSuccess } = useQuery({
    queryKey: applicationKeys.matchingRounds(chapterId),
    queryFn: () => getMatchingRounds(chapterId),
    enabled: chapterId !== undefined,
  })

  return useMemo(
    () => (isSuccess ? isWithinMatchingPeriod(rounds, new Date()) : false),
    [isSuccess, rounds],
  )
}
