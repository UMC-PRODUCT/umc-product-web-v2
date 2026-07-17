import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { ProjectSearchField } from "./ProjectSearchField"

describe("ProjectSearchField", () => {
  it("기존 값 변경 계약과 medium typography를 유지한다", () => {
    const handleChange = vi.fn()

    render(<ProjectSearchField value="" onChange={handleChange} />)

    const input = screen.getByRole("textbox", { name: "프로젝트 검색" })
    fireEvent.change(input, { target: { value: "UMC" } })

    expect(handleChange).toHaveBeenCalledWith("UMC")
    expect(input).toHaveClass("text-body-2-medium")
    expect(input).not.toHaveClass("text-body-2-regular")
  })
})
