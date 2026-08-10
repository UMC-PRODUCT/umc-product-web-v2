import type { RecruitingRoundGroup } from "../api/types"

// phase=OPEN 으로 조회한 차수 그룹만 넘긴다. 마감된 차수가 섞이면 진행 중 판정이
// 어긋난다.
export function hasOpenRound(openGroups: RecruitingRoundGroup[]): boolean {
  return openGroups.some((group) => group.rounds.length > 0)
}

// 평가 중에 추가모집으로 신규 지원자가 들어오는 상황을 알리기 위한 판정이라
// 본모집(REGULAR)은 세지 않는다.
export function hasOpenAdditionalRound(
  openGroups: RecruitingRoundGroup[],
): boolean {
  return openGroups.some((group) =>
    group.rounds.some((round) => round.type === "ADDITIONAL"),
  )
}
