import { beforeEach, describe, expect, it } from "vitest"

import {
  clearAnonymousApplicationSession,
  getOrCreateAnonymousSessionId,
} from "./useAnonymousApplication"

describe("익명 지원 세션", () => {
  beforeEach(() => {
    sessionStorage.clear()
  })

  it("익명 세션 식별자를 없으면 생성하고 있으면 재사용한다", () => {
    const first = getOrCreateAnonymousSessionId()
    const second = getOrCreateAnonymousSessionId()

    expect(first).toBeTruthy()
    expect(second).toBe(first)
  })

  it("익명 지원 상태를 새로 시작할 수 있도록 모두 초기화한다", () => {
    sessionStorage.setItem("isApplicationVerified", "true")
    sessionStorage.setItem("anonymousEmail", "guest@example.com")
    sessionStorage.setItem("anonymousApplicationKey", "A3F9K2")
    sessionStorage.setItem("anonymousSessionId", "session-1")

    clearAnonymousApplicationSession()

    expect(sessionStorage.getItem("isApplicationVerified")).toBeNull()
    expect(sessionStorage.getItem("anonymousEmail")).toBeNull()
    expect(sessionStorage.getItem("anonymousApplicationKey")).toBeNull()
    expect(sessionStorage.getItem("anonymousSessionId")).toBeNull()
  })
})
