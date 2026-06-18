import { toRoundNumber } from "./mappers"

import type { MatchingRoundResponse } from "./apiTypes"

// 차수 번호 -> 합/불 결정 마감(decisionDeadline) epoch ms
// 서버 규칙(APPLY-103): 합/불 결정은 지원 종료(endsAt) 후 ~ 결정 마감(decisionDeadline) 전까지 가능
export function buildDecisionDeadlineByRound(
  rounds: MatchingRoundResponse[] | undefined,
): Map<number, number> {
  const map = new Map<number, number>()
  for (const round of rounds ?? []) {
    const roundNo = toRoundNumber(round.phase)
    const ms = new Date(round.decisionDeadline).getTime()
    if (!Number.isFinite(ms)) continue
    const prev = map.get(roundNo)
    if (prev === undefined || ms > prev) map.set(roundNo, ms)
  }
  return map
}

// 해당 차수의 결정 마감이 지났으면 true(잠금). 마감 정보가 없으면 잠그지 않는다(서버가 최종 검증).
export function isRoundDecisionClosed(
  round: number,
  deadlineByRound: Map<number, number> | undefined,
  now: number,
): boolean {
  const deadline = deadlineByRound?.get(round)
  return deadline !== undefined && now > deadline
}
