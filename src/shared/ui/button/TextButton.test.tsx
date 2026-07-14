import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { TextButton } from "@/shared/ui/button/TextButton"

describe("TextButton", () => {
  it("renders the 16px neutral variant by default", () => {
    render(<TextButton>텍스트 버튼</TextButton>)

    const button = screen.getByRole("button", { name: "텍스트 버튼" })

    expect(button).toHaveAttribute("type", "button")
    expect(button).toHaveClass(
      "text-[16px]",
      "leading-6",
      "text-teal-gray-500",
      "hover:underline",
      "hover:underline-offset-2",
    )
  })

  it("renders the primary variant with the Figma color", () => {
    render(<TextButton color="primary">회원가입</TextButton>)

    expect(screen.getByRole("button", { name: "회원가입" })).toHaveClass(
      "text-teal-500",
      "hover:decoration-teal-500",
    )
  })

  it("renders the 14px neutral variant with its dedicated typography and color", () => {
    render(
      <TextButton size="14" color="neutral">
        계정 설정
      </TextButton>,
    )

    expect(screen.getByRole("button", { name: "계정 설정" })).toHaveClass(
      "text-body-2-medium",
      "text-teal-gray-700",
      "hover:decoration-teal-gray-700",
    )
  })

  it("prevents pointer interaction and removes underline when disabled", () => {
    render(<TextButton disabled>비활성 버튼</TextButton>)

    expect(screen.getByRole("button", { name: "비활성 버튼" })).toHaveClass(
      "disabled:pointer-events-none",
      "disabled:no-underline",
      "disabled:opacity-50",
    )
  })
})
