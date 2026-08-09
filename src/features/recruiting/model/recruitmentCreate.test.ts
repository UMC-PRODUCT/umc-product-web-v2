import { describe, expect, it } from "vitest"

import { periodFieldToInstant } from "./recruitmentCreate"

describe("periodFieldToInstant", () => {
  it("시간 입력을 timezone과 무관하게 UTC wall-clock instant로 만든다", () => {
    expect(
      periodFieldToInstant({ date: "2026-08-01", time: "09:30" }),
    ).toBe("2026-08-01T09:30:00.000Z")
  })
})
