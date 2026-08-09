import { useEffect, useState } from "react"

import {
  isWithinRecruitingPeriod,
  nextRecruitingPeriodBoundary,
} from "@/shared/config/recruitingPeriod"

/**
 * 모집 기간인지, 표시가 바뀌는 시각에 맞춰 다시 계산해서 알려 준다.
 *
 * 렌더 시점에 한 번 읽고 마는 것으로는 부족하다. 헤더는 이동이 없으면 다시
 * 그려지지 않아, 화면을 열어 둔 채 마감을 넘기면 지원하기가 남는다. 주기적으로
 * 되묻는 대신 경계 시각에 한 번만 깨운다.
 */
export function useIsRecruitingPeriod(): boolean {
  const [now, setNow] = useState(() => Date.now())
  const boundary = nextRecruitingPeriodBoundary(now)

  useEffect(() => {
    if (boundary === undefined) return
    // setTimeout 은 약 24.8일이 넘으면 즉시 발화한다. 잘라 두고, 깨어난 김에
    // 다시 잡는다. now 가 바뀌므로 이 효과가 다시 돈다.
    const delay = Math.min(
      Math.max(boundary - Date.now(), 0) + 1000,
      2 ** 31 - 1,
    )
    const timer = setTimeout(() => setNow(Date.now()), delay)
    return () => clearTimeout(timer)
  }, [boundary, now])

  return isWithinRecruitingPeriod(new Date(now))
}
