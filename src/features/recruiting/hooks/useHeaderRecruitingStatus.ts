import { useQuery } from "@tanstack/react-query"
import { useEffect, useState } from "react"

import { useActiveGisuId } from "@/shared/hooks/useActiveGisu"

import { recruitingKeys } from "../api/queryKeys"
import { getPublicRounds } from "../api/recruitingApi"
import {
  nextStatusBoundary,
  resolveRecruitingStatus,
} from "../model/recruitingStatus"

import type { RecruitingStatus } from "@/shared/model/recruitingStatus"

import type { RecruitingPeriod } from "../model/recruitingStatus"

const ROUNDS_STALE_TIME = 5 * 60 * 1000

/**
 * 표시가 바뀌는 시각에 맞춰 한 번 리렌더한다.
 *
 * D-day 는 렌더 시점의 시각으로 계산하는데, 헤더는 이동이 없으면 다시 그려지지
 * 않는다. 화면을 열어 둔 채 자정이나 마감을 넘기면 지난 D-day 가 그대로 남는다.
 * 재조회로 풀면 전 화면에 뜨는 헤더가 주기적으로 요청을 날리게 되므로,
 * 네트워크 없이 타이머로만 다시 계산한다.
 */
function useBoundaryTick(periods: readonly RecruitingPeriod[]): number {
  const [tick, setTick] = useState(0)
  const boundary =
    periods.length > 0 ? nextStatusBoundary(periods, Date.now()) : undefined

  useEffect(() => {
    if (boundary === undefined) return
    // setTimeout 은 약 24.8일이 넘으면 즉시 발화한다. 그 전에 다시 잡으면 된다.
    const delay = Math.min(
      Math.max(boundary - Date.now(), 0) + 1000,
      2 ** 31 - 1,
    )
    const timer = setTimeout(() => setTick((n) => n + 1), delay)
    return () => clearTimeout(timer)
  }, [boundary])

  return tick
}

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
 * 상태 계산기 자체는 예정 차수를 다루므로, 예정 차수를 주는 경로가 생기면
 * 여기서 목록만 넘겨주면 된다.
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

  const periods: RecruitingPeriod[] = (groups ?? []).flatMap((group) =>
    (group.rounds ?? []).map((round) => ({
      documentStartAt: round.documentStartAt,
      documentEndAt: round.documentEndAt,
      applicationOpen: round.applicationOpen,
    })),
  )

  useBoundaryTick(periods)

  if (!groups) return undefined
  return resolveRecruitingStatus(periods, Date.now())
}
