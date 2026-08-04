import { describe, expect, it } from "vitest"

import { recruitingKeys } from "./queryKeys"

describe("recruitingKeys.anonymousApplication", () => {
  it("produces stable and unique query keys for different session IDs", () => {
    const key1 = recruitingKeys.anonymousApplication("session-1")
    const key2 = recruitingKeys.anonymousApplication("session-1")
    const key3 = recruitingKeys.anonymousApplication("session-2")

    expect(key1).toEqual(key2)
    expect(key1).not.toEqual(key3)
  })
})
