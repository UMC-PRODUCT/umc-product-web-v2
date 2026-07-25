import { useQuery } from "@tanstack/react-query"

import { useActiveGisu } from "@/shared/hooks/useActiveGisu"

import { recruitingKeys } from "../api/queryKeys"
import { getRecruitingRounds } from "../api/recruitingApi"

export function useRecruitingRounds() {
  const gisuQuery = useActiveGisu()
  const gisuId =
    gisuQuery.data?.gisuId != null ? String(gisuQuery.data.gisuId) : null

  const roundsQuery = useQuery({
    queryKey: recruitingKeys.roundList({ gisuId: gisuId ?? "" }),
    queryFn: () => getRecruitingRounds({ gisuId: gisuId! }),
    enabled: gisuId != null,
    staleTime: 5 * 60 * 1000,
  })

  return {
    ...roundsQuery,
    groups: roundsQuery.data ?? [],
    generation: gisuQuery.data?.generation,
    isLoading: gisuQuery.isLoading || roundsQuery.isLoading,
  }
}
