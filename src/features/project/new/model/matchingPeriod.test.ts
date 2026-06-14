import { describe, expect, it } from "vitest"

import {
  getNextMatchingBoundary,
  isWithinMatchingPeriod,
} from "./matchingPeriod"

import type { MatchingRoundResponse } from "@/features/application/model/apiTypes"

function makeRound(startsAt: string, endsAt: string): MatchingRoundResponse {
  return {
    id: "1",
    name: "1차 매칭",
    description: "",
    type: "PLAN_DESIGN",
    phase: "FIRST",
    chapterId: "28",
    startsAt,
    endsAt,
    decisionDeadline: endsAt,
    autoDecisionExecutedAt: null,
    autoDecisionExecutedMemberId: null,
    createdAt: "",
    updatedAt: "",
  }
}

describe("isWithinMatchingPeriod", () => {
  const now = new Date("2026-06-13T12:00:00Z")

  it("현재 시각이 차수 기간 내면 true (매칭 중)", () => {
    expect(
      isWithinMatchingPeriod(
        [makeRound("2026-06-13T00:00:00Z", "2026-06-14T00:00:00Z")],
        now,
      ),
    ).toBe(true)
  })

  it("매칭 기간 전이면 false", () => {
    expect(
      isWithinMatchingPeriod(
        [makeRound("2026-06-14T00:00:00Z", "2026-06-15T00:00:00Z")],
        now,
      ),
    ).toBe(false)
  })

  it("매칭 기간 후면 false", () => {
    expect(
      isWithinMatchingPeriod(
        [makeRound("2026-06-10T00:00:00Z", "2026-06-11T00:00:00Z")],
        now,
      ),
    ).toBe(false)
  })

  it("여러 차수 중 하나라도 기간 내면 true", () => {
    expect(
      isWithinMatchingPeriod(
        [
          makeRound("2026-06-10T00:00:00Z", "2026-06-11T00:00:00Z"),
          makeRound("2026-06-13T00:00:00Z", "2026-06-14T00:00:00Z"),
        ],
        now,
      ),
    ).toBe(true)
  })

  it("차수 사이(어느 기간에도 들지 않음)면 false", () => {
    expect(
      isWithinMatchingPeriod(
        [
          makeRound("2026-06-10T00:00:00Z", "2026-06-11T00:00:00Z"),
          makeRound("2026-06-15T00:00:00Z", "2026-06-16T00:00:00Z"),
        ],
        now,
      ),
    ).toBe(false)
  })

  it("시작 경계 시각은 포함하여 true", () => {
    expect(
      isWithinMatchingPeriod(
        [makeRound("2026-06-13T12:00:00Z", "2026-06-14T00:00:00Z")],
        now,
      ),
    ).toBe(true)
  })

  it("종료 경계 시각은 포함하여 true", () => {
    expect(
      isWithinMatchingPeriod(
        [makeRound("2026-06-12T00:00:00Z", "2026-06-13T12:00:00Z")],
        now,
      ),
    ).toBe(true)
  })

  it("빈 배열/undefined는 false", () => {
    expect(isWithinMatchingPeriod([], now)).toBe(false)
    expect(isWithinMatchingPeriod(undefined, now)).toBe(false)
  })
})

describe("getNextMatchingBoundary", () => {
  const now = new Date("2026-06-13T12:00:00Z")

  it("매칭 중이면 종료 시각을 다음 경계로 반환한다", () => {
    const boundary = getNextMatchingBoundary(
      [makeRound("2026-06-13T00:00:00Z", "2026-06-14T00:00:00Z")],
      now,
    )
    expect(boundary?.toISOString()).toBe("2026-06-14T00:00:00.000Z")
  })

  it("매칭 전이면 시작 시각을 다음 경계로 반환한다", () => {
    const boundary = getNextMatchingBoundary(
      [makeRound("2026-06-14T00:00:00Z", "2026-06-15T00:00:00Z")],
      now,
    )
    expect(boundary?.toISOString()).toBe("2026-06-14T00:00:00.000Z")
  })

  it("여러 경계 중 가장 가까운 미래 경계를 반환한다", () => {
    const boundary = getNextMatchingBoundary(
      [
        makeRound("2026-06-10T00:00:00Z", "2026-06-13T18:00:00Z"),
        makeRound("2026-06-20T00:00:00Z", "2026-06-21T00:00:00Z"),
      ],
      now,
    )
    expect(boundary?.toISOString()).toBe("2026-06-13T18:00:00.000Z")
  })

  it("모든 차수가 과거면 null", () => {
    expect(
      getNextMatchingBoundary(
        [makeRound("2026-06-10T00:00:00Z", "2026-06-11T00:00:00Z")],
        now,
      ),
    ).toBeNull()
  })

  it("현재 시각과 같은 경계는 제외하고 다음 미래 경계를 반환한다", () => {
    const boundary = getNextMatchingBoundary(
      [makeRound("2026-06-13T12:00:00Z", "2026-06-14T00:00:00Z")],
      now,
    )
    expect(boundary?.toISOString()).toBe("2026-06-14T00:00:00.000Z")
  })

  it("빈 배열/undefined는 null", () => {
    expect(getNextMatchingBoundary([], now)).toBeNull()
    expect(getNextMatchingBoundary(undefined, now)).toBeNull()
  })
})
