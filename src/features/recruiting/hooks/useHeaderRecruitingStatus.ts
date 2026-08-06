import { useQuery } from "@tanstack/react-query"

import { useActiveGisuId } from "@/shared/hooks/useActiveGisu"

import { recruitingKeys } from "../api/queryKeys"
import { getPublicRounds } from "../api/recruitingApi"
import { resolveRecruitingStatus } from "../model/recruitingStatus"

import type { RecruitingStatus } from "@/shared/model/recruitingStatus"

const ROUNDS_STALE_TIME = 5 * 60 * 1000

/**
 * 헤더 우측 모집 상태(`지원하기 D-n`).
 *
 * 공개 모집 목록은 비인증으로 열려 있어 게스트도 받을 수 있다.
 *
 * 헤더는 전 화면에 뜨므로 요청을 아낀다. 접수 중인 차수가 있으면 그것만으로
 * 답이 나오고, 하나도 없을 때만 마감 여부를 확인하러 PAST 를 더 받는다.
 * 접수 중 목록은 대시보드(useRecruitingProgress)와 같은 키를 써서 캐시를 나눈다.
 *
 * 서버의 OPEN 은 "지금 접수 중", PAST 는 "마감됨" 이라 아직 시작하지 않은 차수는
 * 어느 쪽에도 실리지 않는다. 그래서 `모집 시작 D-n` 은 이 경로로는 나오지 않는다.
 */
export function useHeaderRecruitingStatus(): RecruitingStatus | undefined {
  const { data: gisuId } = useActiveGisuId()
  const enabled = gisuId != null
  const gisuKey = gisuId != null ? String(gisuId) : ""

  const { data: openRounds } = useQuery({
    queryKey: recruitingKeys.openRoundList(gisuKey),
    queryFn: () => getPublicRounds({ gisuId: gisuKey, phase: "OPEN" }),
    enabled,
    staleTime: ROUNDS_STALE_TIME,
    retry: 1,
  })

  const hasOpenRound = (openRounds ?? []).some(
    (group) => (group.rounds ?? []).length > 0,
  )

  const { data: pastRounds } = useQuery({
    queryKey: recruitingKeys.pastRoundList(gisuKey),
    queryFn: () => getPublicRounds({ gisuId: gisuKey, phase: "PAST" }),
    // 접수 중인 차수가 있으면 마감 여부를 볼 필요가 없다.
    enabled: enabled && openRounds !== undefined && !hasOpenRound,
    staleTime: ROUNDS_STALE_TIME,
    retry: 1,
  })

  const groups = hasOpenRound ? openRounds : pastRounds
  if (!groups) return undefined

  const periods = groups.flatMap((group) =>
    (group.rounds ?? []).map((round) => ({
      documentStartAt: round.documentStartAt,
      documentEndAt: round.documentEndAt,
      applicationOpen: round.applicationOpen,
    })),
  )

  return resolveRecruitingStatus(periods, Date.now())
}
