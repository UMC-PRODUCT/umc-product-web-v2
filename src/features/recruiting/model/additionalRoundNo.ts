import type { RecruitingRound } from "../api/types"

export interface AdditionalRoundNoOptions {
  /** 새로 만들 수 있는 차수. 더 만들 수 없으면 없다. */
  nextRoundNo: number | undefined
  /** 이미 쓰고 있는 차수. 오름차순. */
  takenRoundNos: number[]
  /** 임시저장 차수가 번호를 차지하고 있는지. 화면에 이유를 밝히는 데 쓴다. */
  hasDraftHoldingRoundNo: boolean
  /** 마지막 번호까지 차서 더 만들 수 없는지. */
  isExhausted: boolean
}

/**
 * 추가 모집으로 새로 만들 수 있는 차수.
 *
 * 서버는 추가 모집 차수를 이전 차수 바로 다음 번호로만 받는다. 비어 있는
 * 번호를 골라도 거절한다. 화면이 이 규칙을 모른 채 1~5 를 그대로 열어 두면,
 * 세 단계를 다 채운 뒤 생성 시점에야 튕긴다.
 *
 * 임시저장(DRAFT) 차수도 번호를 차지한다. 목록에서는 임시 보관함으로 빠져
 * 있어 사용자 눈에는 안 보이는데, 그래서 "2차까지밖에 없는데 3차가 왜 안
 * 되냐"는 상황이 생긴다. 이유를 밝힐 수 있도록 따로 알려 준다.
 */
export function resolveAdditionalRoundNoOptions(
  rounds: readonly RecruitingRound[],
  maxRoundNo: number,
  editingRoundId?: string | null,
): AdditionalRoundNoOptions {
  const additionalRounds = rounds.filter(
    (round) =>
      round.type === "ADDITIONAL" &&
      // 이어서 쓰는 중인 차수는 자기 번호를 그대로 가져간다.
      String(round.roundId) !== String(editingRoundId ?? ""),
  )

  const takenRoundNos = [
    ...new Set(additionalRounds.map((round) => Number(round.roundNo))),
  ]
    .filter((roundNo) => Number.isFinite(roundNo))
    .sort((left, right) => left - right)

  const lastRoundNo = takenRoundNos.at(-1) ?? 0
  const nextRoundNo = lastRoundNo + 1
  const isExhausted = nextRoundNo > maxRoundNo

  return {
    nextRoundNo: isExhausted ? undefined : nextRoundNo,
    takenRoundNos,
    hasDraftHoldingRoundNo: additionalRounds.some(
      (round) => round.status === "DRAFT",
    ),
    isExhausted,
  }
}
