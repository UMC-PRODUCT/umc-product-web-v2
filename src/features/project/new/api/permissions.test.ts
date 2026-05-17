import { describe, expect, it } from "vitest"

import { canAccessProjectNew } from "./permissions"

describe("canAccessProjectNew", () => {
  it("admin은 접근 가능", () => {
    expect(canAccessProjectNew("admin")).toBe(true)
  })

  it("pm은 접근 가능", () => {
    expect(canAccessProjectNew("pm")).toBe(true)
  })

  it("others는 접근 불가", () => {
    expect(canAccessProjectNew("others")).toBe(false)
  })
})
