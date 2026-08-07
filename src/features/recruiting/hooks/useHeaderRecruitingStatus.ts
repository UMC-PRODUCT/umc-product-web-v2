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
 * 상태는 렌더 시점의 시각으로 계산하는데, 헤더는 이동이 없으면 다시 그려지지
 * 않는다. 화면을 열어 둔 채 마감을 넘기면 접수 중이 그대로 남는다.
 * 재조회로 풀면 전 화면에 뜨는 헤더가 주기적으로 요청을 날리게 되므로,
 * 네트워크 없이 타이머로만 다시 계산한다.
 */
function useBoundaryTick(periods: readonly RecruitingPeriod[]): number {
  const [tick, setTick] = useState(0)
  const boundary = nextStatusBoundary(periods, Date.now())

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
 * 헤더 우측 모집 상태(`지원하기` / `모집 마감`).
 *
 * 공개 모집 목록은 비인증으로 열려 있어 게스트도 받을 수 있다.
 *
 * 헤더는 전 화면에 뜨므로 요청을 아낀다. 접수 중인 차수가 있으면 그것만으로
 * 답이 나오고, 하나도 없을 때만 마감 여부를 확인하러 PAST 를 더 받는다.
 * 접수 중 목록은 대시보드(useRecruitingProgress)와 같은 키를 써서 캐시를 나눈다.
 *
 * 이 값은 헤더 탭 구성도 가른다. 접수 중이면 리크루팅 기간으로 보고 데모데이
 * 매칭 탭을 감춘다.
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
