import { useQuery } from "@tanstack/react-query"

import { useActiveGisu } from "@/shared/hooks/useActiveGisu"

import { recruitingKeys } from "../api/queryKeys"
import { getPublicRounds } from "../api/recruitingApi"
import {
  hasOpenAdditionalRound,
  hasOpenRound,
} from "../model/recruitingProgress"

// 대시보드 툴팁 하단의 모집 상태 문구용. 081/083 집계 응답에는 차수가 열려 있는지가
// 없어서 공개 목록을 따로 본다. phase=OPEN 만 조회하므로 요청은 1회다
// (getAllPublicRounds 는 PAST 까지 합쳐 2회를 쓴다).
//
// 이 조회가 실패하면 두 값 모두 false 가 되어 문구가 사라진다. 모르는 상태에서
// "모집 중"이라고 단정하지 않는 쪽이 안전하다. 집계 데이터는 별도 쿼리라
// 이 실패가 화면을 막지는 않는다.
export function useRecruitingProgress() {
  const gisuQuery = useActiveGisu()
  const gisuId =
    gisuQuery.data?.gisuId != null ? String(gisuQuery.data.gisuId) : null

  const roundsQuery = useQuery({
    queryKey: recruitingKeys.openRoundList(gisuId ?? ""),
    queryFn: () => getPublicRounds({ gisuId: gisuId!, phase: "OPEN" }),
    enabled: gisuId != null,
    staleTime: 60 * 1000,
  })

  const openGroups = roundsQuery.data ?? []

  return {
    isRecruiting: hasOpenRound(openGroups),
    isAdditionalRecruiting: hasOpenAdditionalRound(openGroups),
  }
}
