import { describe, expect, it } from "vitest"

import { resolveAdditionalRoundNoOptions } from "./additionalRoundNo"

import type { RecruitingRound } from "../api/types"

const round = (
  overrides: Partial<RecruitingRound> & Pick<RecruitingRound, "roundId">,
): RecruitingRound =>
  ({
    title: "",
    type: "ADDITIONAL",
    roundNo: 1,
    recruitableTracks: [],
    secondChoiceEnabled: false,
    documentStartAt: null,
    documentEndAt: null,
    documentResultPublishedAt: null,
    interviewRequired: false,
    interviewStartAt: null,
    interviewEndAt: null,
    finalResultPublishedAt: null,
    announcement: null,
    status: "OPEN",
    ...overrides,
  }) as RecruitingRound

describe("resolveAdditionalRoundNoOptions", () => {
  it("추가 모집이 없으면 1차부터 시작한다", () => {
    const result = resolveAdditionalRoundNoOptions([], 5)

    expect(result.nextRoundNo).toBe(1)
    expect(result.takenRoundNos).toEqual([])
    expect(result.isExhausted).toBe(false)
  })

  it("마지막 차수 다음 번호만 고를 수 있다", () => {
    const rounds = [
      round({ roundId: "1", roundNo: 1 }),
      round({ roundId: "2", roundNo: 2 }),
    ]

    const result = resolveAdditionalRoundNoOptions(rounds, 5)

    expect(result.nextRoundNo).toBe(3)
    expect(result.takenRoundNos).toEqual([1, 2])
  })

  // 임시저장 차수도 번호를 이미 차지한다. 목록에서 임시 보관함으로 빠져 있어
  // 사용자 눈에는 안 보이지만 서버는 세고 있다.
  it("임시저장 차수도 번호를 차지한다", () => {
    const rounds = [
      round({ roundId: "1", roundNo: 1 }),
      round({ roundId: "2", roundNo: 2 }),
      round({ roundId: "3", roundNo: 3, status: "DRAFT" }),
      round({ roundId: "4", roundNo: 4, status: "DRAFT" }),
    ]

    const result = resolveAdditionalRoundNoOptions(rounds, 5)

    expect(result.nextRoundNo).toBe(5)
    expect(result.takenRoundNos).toEqual([1, 2, 3, 4])
    expect(result.hasDraftHoldingRoundNo).toBe(true)
  })

  it("정규 모집은 추가 모집 번호와 무관하다", () => {
    const rounds = [
      round({ roundId: "1", type: "REGULAR", roundNo: 1 }),
      round({ roundId: "2", roundNo: 1 }),
    ]

    const result = resolveAdditionalRoundNoOptions(rounds, 5)

    expect(result.nextRoundNo).toBe(2)
    expect(result.takenRoundNos).toEqual([1])
  })

  // 임시저장 차수를 이어서 쓰는 중이면 자기 번호까지 막으면 안 된다.
  it("편집 중인 차수는 자기 번호를 그대로 쓴다", () => {
    const rounds = [
      round({ roundId: "1", roundNo: 1 }),
      round({ roundId: "2", roundNo: 2, status: "DRAFT" }),
    ]

    const result = resolveAdditionalRoundNoOptions(rounds, 5, "2")

    expect(result.nextRoundNo).toBe(2)
    expect(result.takenRoundNos).toEqual([1])
  })

  it("마지막 번호까지 차면 더 만들 수 없다고 알린다", () => {
    const rounds = [1, 2, 3, 4, 5].map((n) =>
      round({ roundId: String(n), roundNo: n }),
    )

    const result = resolveAdditionalRoundNoOptions(rounds, 5)

    expect(result.isExhausted).toBe(true)
    expect(result.nextRoundNo).toBeUndefined()
  })

  // 번호가 띄엄띄엄해도 서버는 마지막 다음 번호만 받는다.
  it("번호가 비어 있어도 마지막 다음 번호를 낸다", () => {
    const rounds = [
      round({ roundId: "1", roundNo: 1 }),
      round({ roundId: "3", roundNo: 3 }),
    ]

    const result = resolveAdditionalRoundNoOptions(rounds, 5)

    expect(result.nextRoundNo).toBe(4)
    expect(result.takenRoundNos).toEqual([1, 3])
  })
})
