import { useQuery } from "@tanstack/react-query"

import { useActiveGisuId } from "@/shared/hooks/useActiveGisu"

import { getAllPublicRounds } from "../api/recruitingApi"
import { resolveRecruitingStatus } from "../model/recruitingStatus"

import type { RecruitingStatus } from "@/shared/model/recruitingStatus"

/**
 * 헤더 우측 모집 상태(`지원하기 D-n`).
 *
 * 공개 모집 목록은 비인증으로 열려 있어 게스트도 받을 수 있다. 헤더는 모든
 * 화면에 뜨므로 자주 바뀌지 않는 값을 오래 캐싱한다.
 */
export function useHeaderRecruitingStatus(): RecruitingStatus | undefined {
  const { data: gisuId } = useActiveGisuId()

  const { data } = useQuery({
    queryKey: ["headerRecruitingStatus", gisuId],
    // 공개 목록의 phase 기본값이 OPEN 이라 그대로 부르면 마감된 차수가 빠지고,
    // 전부 마감된 기수에서 "모집 마감" 대신 아무것도 뜨지 않는다.
    queryFn: () => getAllPublicRounds(String(gisuId)),
    enabled: gisuId != null,
    staleTime: 5 * 60 * 1000,
    // 실패해도 헤더는 그려야 한다. 상태 버튼만 빠진다.
    retry: 1,
  })

  if (!data) return undefined

  const periods = data.flatMap((group) =>
    (group.rounds ?? []).map((round) => ({
      documentStartAt: round.documentStartAt,
      documentEndAt: round.documentEndAt,
      applicationOpen: round.applicationOpen,
    })),
  )

  return resolveRecruitingStatus(periods, Date.now())
}
