import { useQuery } from "@tanstack/react-query"
import { isAxiosError } from "axios"

import { useActiveGisu } from "@/shared/hooks/useActiveGisu"

import { recruitingKeys } from "../api/queryKeys"
import { getAdminRounds } from "../api/recruitingApi"

// 모집 생성 화면에서 seasonId를 찾는 용도 전용. 공개 목록(useRecruitingRounds)은
// OPEN/CLOSED 차수만 내려줘서 차수가 하나도 없는 시즌은 빠지므로, 관리자용
// 목록(GET /admin/rounds)에서 시즌 자체를 조회해야 한다.
export function useAdminRecruitingRounds() {
  const gisuQuery = useActiveGisu()
  const gisuId =
    gisuQuery.data?.gisuId != null ? String(gisuQuery.data.gisuId) : null

  const roundsQuery = useQuery({
    queryKey: recruitingKeys.adminRoundList(gisuId ?? ""),
    queryFn: () => getAdminRounds({ gisuId: gisuId! }),
    enabled: gisuId != null,
    // 이 엔드포인트는 학교 회장단 이상만 조회 가능하다. 403은 권한이 없다는
    // 확정 답이라 재시도해도 결과가 안 바뀌므로, 그 외 실패만 재시도한다.
    retry: (failureCount, error) =>
      !(isAxiosError(error) && error.response?.status === 403) &&
      failureCount < 2,
    staleTime: 5 * 60 * 1000,
  })

  // 403은 "관리 권한 없음"이라는 확정 신호, 그 외 실패는 아무것도 증명하지 못한다.
  const isForbidden =
    roundsQuery.isError &&
    isAxiosError(roundsQuery.error) &&
    roundsQuery.error.response?.status === 403

  return {
    ...roundsQuery,
    groups: roundsQuery.data ?? [],
    isLoading: gisuQuery.isLoading || roundsQuery.isLoading,
    isError: gisuQuery.isError || roundsQuery.isError,
    isForbidden,
  }
}
