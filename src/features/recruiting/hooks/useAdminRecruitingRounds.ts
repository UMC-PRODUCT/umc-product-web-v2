import { useQuery } from "@tanstack/react-query"
import { isAxiosError } from "axios"

import { useActiveGisu } from "@/shared/hooks/useActiveGisu"

import { recruitingKeys } from "../api/queryKeys"
import { getAdminRounds, getAllPublicRounds } from "../api/recruitingApi"

import type { AdminRoundsQuery } from "../api/types"

export interface AdminRecruitingRoundsOptions {
  fresh?: boolean
  refetchInterval?: number | false
}

// 모집 생성 화면에서 seasonId를 찾는 용도 전용. 공개 목록(useRecruitingRounds)은
// OPEN/CLOSED 차수만 내려줘서 차수가 하나도 없는 시즌은 빠지므로, 관리자용
// 목록(GET /admin/rounds)에서 시즌 자체를 조회해야 한다.
// 평가자 권한만 있는 운영진 등 권한 부족으로 403을 받는 경우 공개 목록으로 폴백한다.
export function useAdminRecruitingRounds(
  sort?: AdminRoundsQuery["sort"],
  options: AdminRecruitingRoundsOptions = {},
) {
  const shouldRefresh = options.fresh ?? false
  const gisuQuery = useActiveGisu()
  const gisuId =
    gisuQuery.data?.gisuId != null ? String(gisuQuery.data.gisuId) : null

  const roundsQuery = useQuery({
    queryKey: recruitingKeys.adminRoundList(gisuId ?? "", sort),
    queryFn: async () => {
      try {
        return await getAdminRounds({ gisuId: gisuId!, sort })
      } catch (error) {
        if (isAxiosError(error) && error.response?.status === 403) {
          return await getAllPublicRounds(gisuId!)
        }
        throw error
      }
    },
    enabled: gisuId != null,
    retry: (failureCount, error) =>
      !(isAxiosError(error) && error.response?.status === 403) &&
      failureCount < 2,
    staleTime: shouldRefresh ? 0 : 5 * 60 * 1000,
    refetchOnMount: shouldRefresh ? "always" : true,
    refetchOnWindowFocus: shouldRefresh,
    refetchInterval: options.refetchInterval ?? false,
  })

  const isForbidden =
    roundsQuery.isError &&
    isAxiosError(roundsQuery.error) &&
    roundsQuery.error.response?.status === 403

  return {
    ...roundsQuery,
    groups: roundsQuery.data ?? [],
    generation: gisuQuery.data?.generation,
    isLoading: gisuQuery.isLoading || roundsQuery.isLoading,
    isError: gisuQuery.isError || roundsQuery.isError,
    isForbidden,
  }
}
