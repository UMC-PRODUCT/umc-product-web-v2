import { useQuery } from "@tanstack/react-query"
import { useMemo } from "react"

import { useActiveGisu } from "@/shared/hooks/useActiveGisu"

import { isServerRejection } from "../api/errors"
import { recruitingKeys } from "../api/queryKeys"
import { getAllDecisionHistories } from "../api/recruitingApi"
import {
  toEvaluationHistoryEntries,
  toHistoryProgress,
} from "../model/evaluationHistoryMapper"

// 활성 기수를 못 받은 상태에서는 조회하지 않는다. 기수 폴백을 두면 엉뚱한 기수의
// 이력을 보여주게 된다.
//
// 필터·정렬·그룹핑은 화면이 클라이언트에서 처리하므로 전량을 받아 온다. 서버도
// 같은 필터를 지원하지만 chapterId/schoolId 가 단일 숫자 ID 라 이름 기반 다중
// 선택인 현재 필터 바와 바로 맞물리지 않는다. 서버 필터로 옮기는 건 별도 작업이다.
export function useEvaluationHistory() {
  const gisuQuery = useActiveGisu()
  const gisuId =
    gisuQuery.data?.gisuId != null ? String(gisuQuery.data.gisuId) : null

  const historyQuery = useQuery({
    queryKey: recruitingKeys.decisionHistories(gisuId ?? ""),
    queryFn: () => getAllDecisionHistories({ gisuId: gisuId! }),
    enabled: gisuId != null,
    staleTime: 60 * 1000,
    // 권한 부족 등 서버가 확정 응답한 실패는 재시도하지 않는다(전역 기본값 retry: 1).
    // 이 화면은 학교·지부 운영진이 403 을 받는 게 정상 설계라 실제로 자주 탄다.
    retry: (failureCount, error) =>
      !isServerRejection(error) && failureCount < 1,
  })

  const { data } = historyQuery
  const rows = useMemo(
    () => (data ? toEvaluationHistoryEntries(data.content) : []),
    [data],
  )

  return {
    ...historyQuery,
    // 활성 기수를 못 받으면 쿼리가 비활성이라 isLoading/isError 가 모두 false 다.
    // 조회 실패와 구분해 안내를 다르게 한다.
    hasActiveGisu: gisuId != null,
    rows,
    // 서버가 판정 대상 전원 완료 기준으로 계산해 준다. 화면에서 행 개수로 추측하던
    // 것을 대체한다.
    progress: data ? toHistoryProgress(data.progressStatus) : "before",
    asOf: data?.asOf ?? null,
    gisuId,
    generation: gisuQuery.data?.generation,
    isLoading: gisuQuery.isLoading || historyQuery.isLoading,
    isError: gisuQuery.isError || historyQuery.isError,
  }
}
