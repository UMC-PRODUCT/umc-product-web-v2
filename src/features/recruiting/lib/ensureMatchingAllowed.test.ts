import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import {
  HEADER_RECRUITING_WINDOW_END,
  HEADER_RECRUITING_WINDOW_START,
} from "@/shared/config/headerRecruitingWindow"

import { ensureMatchingAllowed } from "./ensureMatchingAllowed"

// redirect() 가 던지는 값은 목적지를 options 안에 담는다.
function redirectTarget(error: unknown) {
  return (error as { options?: { to?: string } }).options?.to
}

function callAt(iso: string) {
  vi.setSystemTime(new Date(iso))
  try {
    ensureMatchingAllowed()
    return undefined
  } catch (error) {
    return error
  }
}

const START = Date.parse(HEADER_RECRUITING_WINDOW_START)
const END = Date.parse(HEADER_RECRUITING_WINDOW_END)

describe("ensureMatchingAllowed", () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it("모집 기간에는 프로젝트 목록으로 돌려보낸다", () => {
    const error = callAt(new Date((START + END) / 2).toISOString())

    expect(redirectTarget(error)).toBe("/projects")
  })

  it("모집 시작 전에는 통과시킨다", () => {
    const error = callAt(new Date(START - 1000).toISOString())

    expect(error).toBeUndefined()
  })

  // 창은 시작 시각을 포함한다.
  it("모집 시작 순간부터 막는다", () => {
    expect(redirectTarget(callAt(new Date(START).toISOString()))).toBe(
      "/projects",
    )
  })

  // 끝 시각은 포함하지 않는다. 09-01 00:00 은 이미 닫힌 것으로 본다.
  it("모집 종료 순간부터 통과시킨다", () => {
    expect(callAt(new Date(END).toISOString())).toBeUndefined()
  })

  it("모집이 끝난 뒤에는 통과시킨다", () => {
    expect(callAt(new Date(END + 1000).toISOString())).toBeUndefined()
  })
})
