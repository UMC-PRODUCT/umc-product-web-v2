import { describe, expect, it } from "vitest"

import {
  HEADER_RECRUITING_WINDOW_END,
  HEADER_RECRUITING_WINDOW_START,
  isWithinHeaderRecruitingWindow,
  nextHeaderRecruitingWindowBoundary,
} from "./headerRecruitingWindow"

const start = new Date(HEADER_RECRUITING_WINDOW_START)
const end = new Date(HEADER_RECRUITING_WINDOW_END)

describe("isWithinHeaderRecruitingWindow", () => {
  it("기간 안이면 열려 있다", () => {
    expect(
      isWithinHeaderRecruitingWindow(new Date(start.getTime() + 1000)),
    ).toBe(true)
  })

  it("시작 시각은 포함한다", () => {
    expect(isWithinHeaderRecruitingWindow(start)).toBe(true)
  })

  // 끝나는 시각을 포함하면 09-01 00:00 정각에 하루가 더 열린 것처럼 보인다
  it("끝나는 시각은 포함하지 않는다", () => {
    expect(isWithinHeaderRecruitingWindow(end)).toBe(false)
  })

  it("시작 전이면 닫혀 있다", () => {
    expect(
      isWithinHeaderRecruitingWindow(new Date(start.getTime() - 1000)),
    ).toBe(false)
  })

  it("끝난 뒤면 닫혀 있다", () => {
    expect(isWithinHeaderRecruitingWindow(new Date(end.getTime() + 1000))).toBe(
      false,
    )
  })

  // 오프셋을 빼먹으면 보는 사람의 시간대만큼 경계가 밀린다
  it("경계는 한국 시각 기준이다", () => {
    expect(HEADER_RECRUITING_WINDOW_START.endsWith("+09:00")).toBe(true)
    expect(HEADER_RECRUITING_WINDOW_END.endsWith("+09:00")).toBe(true)
    expect(
      isWithinHeaderRecruitingWindow(new Date("2026-08-08T15:00:00Z")),
    ).toBe(true)
    expect(
      isWithinHeaderRecruitingWindow(new Date("2026-08-08T14:59:59Z")),
    ).toBe(false)
  })
})

describe("nextHeaderRecruitingWindowBoundary", () => {
  it("시작 전이면 시작 시각을 알려 준다", () => {
    expect(nextHeaderRecruitingWindowBoundary(start.getTime() - 1000)).toBe(
      start.getTime(),
    )
  })

  it("기간 안이면 끝나는 시각을 알려 준다", () => {
    expect(nextHeaderRecruitingWindowBoundary(start.getTime())).toBe(
      end.getTime(),
    )
    expect(nextHeaderRecruitingWindowBoundary(end.getTime() - 1000)).toBe(
      end.getTime(),
    )
  })

  // 더 바뀔 것이 없으면 타이머를 잡지 않도록 없다고 답해야 한다
  it("끝난 뒤면 없다고 답한다", () => {
    expect(nextHeaderRecruitingWindowBoundary(end.getTime())).toBeUndefined()
    expect(
      nextHeaderRecruitingWindowBoundary(end.getTime() + 1000),
    ).toBeUndefined()
  })
})
