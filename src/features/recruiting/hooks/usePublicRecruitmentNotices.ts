import { useQuery } from "@tanstack/react-query"
import { useMemo } from "react"

import { useActiveGisu } from "@/shared/hooks/useActiveGisu"

import { recruitingKeys } from "../api/queryKeys"
import { getAllPublicRounds } from "../api/recruitingApi"
import { toRecruitmentNoticeItems } from "../model/recruitmentNoticeMapper"

export function usePublicRecruitmentNotices() {
  const gisuQuery = useActiveGisu()
  const gisuId =
    gisuQuery.data?.gisuId != null ? String(gisuQuery.data.gisuId) : null

  // 서버는 phase 를 생략하면 지원 기간이 열린 차수만 준다. '이미 지난 모집'
  // 탭을 채우려면 두 구간을 모두 받아야 해서 getAllPublicRounds 를 쓴다.
  const query = useQuery({
    queryKey: recruitingKeys.roundList(gisuId ?? ""),
    queryFn: () => getAllPublicRounds(gisuId!),
    enabled: gisuId != null,
    staleTime: 5 * 60 * 1000,
  })

  const items = useMemo(
    () => toRecruitmentNoticeItems(query.data ?? []),
    [query.data],
  )

  return {
    items,
    isLoading: gisuQuery.isLoading || query.isLoading,
    isError: gisuQuery.isError || query.isError,
  }
}
