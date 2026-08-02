import { useQuery } from "@tanstack/react-query"
import { isAxiosError } from "axios"

import { useActiveGisu } from "@/shared/hooks/useActiveGisu"

import { recruitingKeys } from "../api/queryKeys"
import { getAdminRounds, getAllPublicRounds } from "../api/recruitingApi"

/**
 * 공개 목록(useRecruitingRounds)은 OPEN/CLOSED 차수만 내려줘서 차수가 하나도 없는 시즌(DRAFT)은 빠지므로,
 * 관리자용 목록(GET /admin/rounds)에서 시즌 자체를 조회해야 한다.
 * 평가자 권한만 있는 운영진 등 권한 부족으로 403을 받는 경우 공개 목록으로 폴백한다.
 */
export function useAdminRecruitingRounds() {
  const gisuQuery = useActiveGisu()
  const gisuId =
    gisuQuery.data?.gisuId != null ? String(gisuQuery.data.gisuId) : null

  const roundsQuery = useQuery({
    queryKey: recruitingKeys.adminRoundList(gisuId ?? ""),
    queryFn: async () => {
      try {
        return await getAdminRounds(gisuId!)
      } catch (error) {
        if (isAxiosError(error) && error.response?.status === 403) {
          return await getAllPublicRounds(gisuId!)
        }
        throw error
      }
    },
    enabled: gisuId != null,
    staleTime: 5 * 60 * 1000,
  })

  return {
    ...roundsQuery,
    groups: roundsQuery.data ?? [],
    generation: gisuQuery.data?.generation,
    isLoading: gisuQuery.isLoading || roundsQuery.isLoading,
    isError: gisuQuery.isError || roundsQuery.isError,
  }
}
