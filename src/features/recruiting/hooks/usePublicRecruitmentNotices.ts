import { useQuery } from "@tanstack/react-query"
import { useMemo } from "react"

import { useActiveGisu } from "@/shared/hooks/useActiveGisu"

import { recruitingKeys } from "../api/queryKeys"
import { getAllPublicRounds } from "../api/recruitingApi"
import {
  toMyApplicationsByRoundId,
  toRecruitmentNoticeItems,
} from "../model/recruitmentNoticeMapper"
import { useMyRecruitingApplicationsQuery } from "./useMyApplications"

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

  // 로그인 사용자만 조회된다(비로그인은 enabled: false 라 항상 빈 목록).
  const myApplicationsQuery = useMyRecruitingApplicationsQuery()

  const myApplicationsByRoundId = useMemo(
    () => toMyApplicationsByRoundId(myApplicationsQuery.data ?? []),
    [myApplicationsQuery.data],
  )

  const items = useMemo(
    () =>
      toRecruitmentNoticeItems(
        query.data ?? [],
        undefined,
        myApplicationsByRoundId,
      ),
    [query.data, myApplicationsByRoundId],
  )

  return {
    items,
    isLoading: gisuQuery.isLoading || query.isLoading,
    isError: gisuQuery.isError || query.isError,
  }
}
