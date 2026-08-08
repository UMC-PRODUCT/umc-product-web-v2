import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { normalizeQuotaInput, QuotaEditableCell } from "./QuotaEditableCell"

describe("normalizeQuotaInput", () => {
  it("기존 0에 숫자를 입력하면 앞뒤에 0이 남지 않는다", () => {
    expect(normalizeQuotaInput("0", "10")).toBe("1")
    expect(normalizeQuotaInput("0", "01")).toBe("1")
  })

  it("일반적인 숫자와 빈 입력은 유지한다", () => {
    expect(normalizeQuotaInput("1", "10")).toBe("10")
    expect(normalizeQuotaInput("10", "")).toBe("")
  })
})

describe("QuotaEditableCell", () => {
  it("0 앞에 숫자를 입력해도 10이 아닌 1로 반영한다", () => {
    const onChange = vi.fn()

    render(<QuotaEditableCell partName="PM" value={0} onChange={onChange} />)

    const input = screen.getByRole("textbox", { name: "PM TO" })
    fireEvent.change(input, { target: { value: "10" } })

    expect(onChange).toHaveBeenCalledWith(1)
    expect(input).toHaveValue("1")
  })
})
