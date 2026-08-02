import { describe, expect, it } from "vitest"

import { recruitingKeys } from "./queryKeys"

describe("recruitingKeys.anonymousApplication", () => {
  it("does not include email or applicationKey in plaintext in the query key", () => {
    const email = "applicant@example.com"
    const applicationKey = "123456"

    const key = recruitingKeys.anonymousApplication(email, applicationKey)

    expect(key).toContain("recruiting")
    expect(key).toContain("anonymous")
    expect(key).not.toContain(email)
    expect(key).not.toContain(applicationKey)
  })

  it("produces stable and unique query keys for different inputs", () => {
    const key1 = recruitingKeys.anonymousApplication(
      "user1@example.com",
      "123456",
    )
    const key2 = recruitingKeys.anonymousApplication(
      "user1@example.com",
      "123456",
    )
    const key3 = recruitingKeys.anonymousApplication(
      "user2@example.com",
      "123456",
    )
    const key4 = recruitingKeys.anonymousApplication(
      "user1@example.com",
      "654321",
    )

    expect(key1).toEqual(key2)
    expect(key1).not.toEqual(key3)
    expect(key1).not.toEqual(key4)
  })
})
