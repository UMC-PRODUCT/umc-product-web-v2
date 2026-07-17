import { fireEvent, render, screen } from "@testing-library/react"
import { createRef } from "react"
import { describe, expect, it, vi } from "vitest"

import { SearchField } from "@/shared/ui/search-field/SearchField"

describe("SearchField", () => {
  it("forwards the input ref and native props", () => {
    const ref = createRef<HTMLInputElement>()

    render(
      <SearchField
        ref={ref}
        aria-label="지원자 검색"
        name="applicant-search"
        placeholder="지원자 명으로 검색하세요"
        autoComplete="off"
        disabled
      />,
    )

    const input = screen.getByRole("textbox", { name: "지원자 검색" })

    expect(ref.current).toBe(input)
    expect(input).toHaveAttribute("type", "text")
    expect(input).toHaveAttribute("name", "applicant-search")
    expect(input).toHaveAttribute("placeholder", "지원자 명으로 검색하세요")
    expect(input).toHaveAttribute("autocomplete", "off")
    expect(input).toBeDisabled()
    expect(input.parentElement).toHaveClass("focus-within:border-teal-400")
  })

  it("passes the native change event to the consumer", () => {
    const handleChange = vi.fn()

    render(<SearchField aria-label="프로젝트 검색" onChange={handleChange} />)

    const input = screen.getByRole("textbox", { name: "프로젝트 검색" })
    fireEvent.change(input, { target: { value: "UMC" } })

    expect(handleChange).toHaveBeenCalledOnce()
    expect(input).toHaveValue("UMC")
  })

  it("allows consumers to customize the container and typography", () => {
    render(
      <SearchField
        aria-label="프로젝트 검색"
        className="w-80"
        inputClassName="text-body-2-medium"
      />,
    )

    const input = screen.getByRole("textbox", { name: "프로젝트 검색" })

    expect(input.parentElement).toHaveClass("w-80")
    expect(input).toHaveClass("text-body-2-medium")
    expect(input).not.toHaveClass("text-body-2-regular")
  })
})
