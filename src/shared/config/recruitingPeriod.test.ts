import { describe, expect, it } from "vitest"

import {
  isWithinRecruitingPeriod,
  nextRecruitingPeriodBoundary,
  RECRUITING_PERIOD_END,
  RECRUITING_PERIOD_START,
} from "./recruitingPeriod"

const start = new Date(RECRUITING_PERIOD_START)
const end = new Date(RECRUITING_PERIOD_END)

describe("isWithinRecruitingPeriod", () => {
  it("기간 안이면 열려 있다", () => {
    expect(isWithinRecruitingPeriod(new Date(start.getTime() + 1000))).toBe(
      true,
    )
  })

  it("시작 시각은 포함한다", () => {
    expect(isWithinRecruitingPeriod(start)).toBe(true)
  })

  // 끝나는 시각을 포함하면 09-01 00:00 정각에 하루가 더 열린 것처럼 보인다
  it("끝나는 시각은 포함하지 않는다", () => {
    expect(isWithinRecruitingPeriod(end)).toBe(false)
  })

  it("시작 전이면 닫혀 있다", () => {
    expect(isWithinRecruitingPeriod(new Date(start.getTime() - 1000))).toBe(
      false,
    )
  })

  it("끝난 뒤면 닫혀 있다", () => {
    expect(isWithinRecruitingPeriod(new Date(end.getTime() + 1000))).toBe(false)
  })

  // 오프셋을 빼먹으면 보는 사람의 시간대만큼 경계가 밀린다
  it("경계는 한국 시각 기준이다", () => {
    expect(RECRUITING_PERIOD_START.endsWith("+09:00")).toBe(true)
    expect(RECRUITING_PERIOD_END.endsWith("+09:00")).toBe(true)
    expect(isWithinRecruitingPeriod(new Date("2026-08-08T15:00:00Z"))).toBe(
      true,
    )
    expect(isWithinRecruitingPeriod(new Date("2026-08-08T14:59:59Z"))).toBe(
      false,
    )
  })
})

describe("nextRecruitingPeriodBoundary", () => {
  it("시작 전이면 시작 시각을 알려 준다", () => {
    expect(nextRecruitingPeriodBoundary(start.getTime() - 1000)).toBe(
      start.getTime(),
    )
  })

  it("기간 안이면 끝나는 시각을 알려 준다", () => {
    expect(nextRecruitingPeriodBoundary(start.getTime())).toBe(end.getTime())
    expect(nextRecruitingPeriodBoundary(end.getTime() - 1000)).toBe(
      end.getTime(),
    )
  })

  // 더 바뀔 것이 없으면 타이머를 잡지 않도록 없다고 답해야 한다
  it("끝난 뒤면 없다고 답한다", () => {
    expect(nextRecruitingPeriodBoundary(end.getTime())).toBeUndefined()
    expect(nextRecruitingPeriodBoundary(end.getTime() + 1000)).toBeUndefined()
  })
})
