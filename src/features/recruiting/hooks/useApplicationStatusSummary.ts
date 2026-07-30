import { useQuery } from "@tanstack/react-query"

import { useActiveGisu } from "@/shared/hooks/useActiveGisu"

import { isServerRejection } from "../api/errors"
import { recruitingKeys } from "../api/queryKeys"
import { getStatusSummary } from "../api/recruitingApi"

// 활성 기수를 못 받은 상태에서는 조회하지 않는다. 기수 폴백을 두면 엉뚱한 기수의
// 집계를 보여주게 된다.
export function useApplicationStatusSummary() {
  const gisuQuery = useActiveGisu()
  const gisuId =
    gisuQuery.data?.gisuId != null ? String(gisuQuery.data.gisuId) : null

  const summaryQuery = useQuery({
    queryKey: recruitingKeys.statusSummary(gisuId ?? ""),
    queryFn: () => getStatusSummary({ gisuId: gisuId! }),
    enabled: gisuId != null,
    staleTime: 60 * 1000,
    // 권한 부족 등 서버가 확정 응답한 실패는 재시도하지 않는다(전역 기본값 retry: 1).
    retry: (failureCount, error) =>
      !isServerRejection(error) && failureCount < 1,
  })

  return {
    ...summaryQuery,
    generation: gisuQuery.data?.generation,
    isLoading: gisuQuery.isLoading || summaryQuery.isLoading,
    isError: gisuQuery.isError || summaryQuery.isError,
  }
}
