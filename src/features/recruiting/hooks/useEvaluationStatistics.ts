import { useQuery } from "@tanstack/react-query"

import { useActiveGisu } from "@/shared/hooks/useActiveGisu"

import { isServerRejection } from "../api/errors"
import { recruitingKeys } from "../api/queryKeys"
import { getEvaluationStatistics } from "../api/recruitingApi"

// 활성 기수를 못 받은 상태에서는 조회하지 않는다. 기수 폴백을 두면 엉뚱한 기수의
// 집계를 보여주게 된다.
export function useEvaluationStatistics() {
  const gisuQuery = useActiveGisu()
  const gisuId =
    gisuQuery.data?.gisuId != null ? String(gisuQuery.data.gisuId) : null

  const statisticsQuery = useQuery({
    queryKey: recruitingKeys.evaluationStatistics(gisuId ?? ""),
    queryFn: () => getEvaluationStatistics(gisuId!),
    enabled: gisuId != null,
    staleTime: 60 * 1000,
    // 권한 부족 등 서버가 확정 응답한 실패는 재시도하지 않는다(전역 기본값 retry: 1).
    retry: (failureCount, error) =>
      !isServerRejection(error) && failureCount < 1,
  })

  return {
    // 활성 기수를 못 받으면 쿼리가 비활성이라 isLoading/isError 가 모두 false 이고
    // data 도 undefined 다. 그대로 두면 화면이 조회 실패로 오인해 "잠시 후 다시
    // 시도해주세요"를 띄운다. 기다려도 안 풀리는 상태라 별도로 알린다.
    hasActiveGisu: gisuId != null,
    ...statisticsQuery,
    generation: gisuQuery.data?.generation,
    isLoading: gisuQuery.isLoading || statisticsQuery.isLoading,
    isError: gisuQuery.isError || statisticsQuery.isError,
  }
}
