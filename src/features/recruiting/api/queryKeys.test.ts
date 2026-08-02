import { describe, expect, it } from "vitest"

import { recruitingKeys } from "./queryKeys"

describe("recruitingKeys.anonymousApplication", () => {
  it("uses random opaque session identifier in the query key without credential-derived parameters", () => {
    const sessionId = "session-550e8400-e29b-41d4-a716-446655440000"

    const key = recruitingKeys.anonymousApplication(sessionId)

    expect(key).toEqual(["recruiting", "anonymous", sessionId])
    expect(key).not.toContain("applicant@example.com")
    expect(key).not.toContain("123456")
  })

  it("produces stable and unique query keys for different session IDs", () => {
    const key1 = recruitingKeys.anonymousApplication("session-1")
    const key2 = recruitingKeys.anonymousApplication("session-1")
    const key3 = recruitingKeys.anonymousApplication("session-2")

    expect(key1).toEqual(key2)
    expect(key1).not.toEqual(key3)
  })
})
