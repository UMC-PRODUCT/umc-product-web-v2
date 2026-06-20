import { describe, expect, it } from "vitest"

import {
  buildDecisionDeadlineByRound,
  isRoundDecisionClosed,
} from "./matchingDecision"

import type { MatchingRoundResponse } from "./apiTypes"

function makeRound(
  phase: MatchingRoundResponse["phase"],
  decisionDeadline: string,
): MatchingRoundResponse {
  return {
    id: "1",
    name: `${phase} 차수`,
    description: "",
    type: "PLAN_DEVELOPER",
    phase,
    chapterId: "1",
    startsAt: "2026-06-01T00:00:00Z",
    endsAt: "2026-06-05T00:00:00Z",
    decisionDeadline,
    autoDecisionExecutedAt: null,
    autoDecisionExecutedMemberId: null,
    createdAt: "2026-06-01T00:00:00Z",
    updatedAt: "2026-06-01T00:00:00Z",
  }
}

describe("buildDecisionDeadlineByRound", () => {
  it("phase를 차수 번호로 매핑해 decisionDeadline(ms)을 담는다", () => {
    const map = buildDecisionDeadlineByRound([
      makeRound("FIRST", "2026-06-10T00:00:00Z"),
      makeRound("SECOND", "2026-06-20T00:00:00Z"),
      makeRound("THIRD", "2026-06-30T00:00:00Z"),
    ])
    expect(map.get(1)).toBe(new Date("2026-06-10T00:00:00Z").getTime())
    expect(map.get(2)).toBe(new Date("2026-06-20T00:00:00Z").getTime())
    expect(map.get(3)).toBe(new Date("2026-06-30T00:00:00Z").getTime())
  })

  it("rounds가 없으면 빈 맵", () => {
    expect(buildDecisionDeadlineByRound(undefined).size).toBe(0)
    expect(buildDecisionDeadlineByRound([]).size).toBe(0)
  })

  it("같은 차수가 중복되면 더 늦은 마감을 채택한다", () => {
    const map = buildDecisionDeadlineByRound([
      makeRound("FIRST", "2026-06-10T00:00:00Z"),
      makeRound("FIRST", "2026-06-15T00:00:00Z"),
    ])
    expect(map.get(1)).toBe(new Date("2026-06-15T00:00:00Z").getTime())
  })
})

describe("isRoundDecisionClosed", () => {
  const map = buildDecisionDeadlineByRound([
    makeRound("FIRST", "2026-06-10T00:00:00Z"),
    makeRound("SECOND", "2026-06-20T00:00:00Z"),
  ])

  it("결정 마감 전이면 잠그지 않는다(1차 마감 후 2차 진행 중이어도 1차 결정 가능)", () => {
    const now = new Date("2026-06-08T00:00:00Z").getTime()
    expect(isRoundDecisionClosed(1, map, now)).toBe(false)
  })

  it("결정 마감이 지나면 잠근다", () => {
    const now = new Date("2026-06-11T00:00:00Z").getTime()
    expect(isRoundDecisionClosed(1, map, now)).toBe(true)
    expect(isRoundDecisionClosed(2, map, now)).toBe(false)
  })

  it("마감 정보가 없는 차수/맵은 잠그지 않는다(서버가 최종 검증)", () => {
    const now = new Date("2026-06-25T00:00:00Z").getTime()
    expect(isRoundDecisionClosed(3, map, now)).toBe(false)
    expect(isRoundDecisionClosed(1, undefined, now)).toBe(false)
  })

  // 인시던트(자정 직전 합불 불가) 회귀 방지: 마감 "정확한 순간" 경계 고정
  describe("결정 마감 경계 (now vs deadline)", () => {
    const deadline = new Date("2026-06-20T00:00:00Z").getTime()
    const boundaryMap = buildDecisionDeadlineByRound([
      makeRound("SECOND", "2026-06-20T00:00:00Z"),
    ])

    it("마감 1ms 전: 열림 (지원자 합불 가능)", () => {
      expect(isRoundDecisionClosed(2, boundaryMap, deadline - 1)).toBe(false)
    })

    it("마감 정각(now === deadline): 열림 (> 비교라 잠그지 않음)", () => {
      expect(isRoundDecisionClosed(2, boundaryMap, deadline)).toBe(false)
    })

    it("마감 1ms 후: 잠김 (자동 확정 영역)", () => {
      expect(isRoundDecisionClosed(2, boundaryMap, deadline + 1)).toBe(true)
    })
  })
})
