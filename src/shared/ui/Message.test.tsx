import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { Message } from "./Message"

describe("Message", () => {
  it.each([
    ["error", "text-error-500"],
    ["success", "text-success-600"],
    ["default", "text-teal-gray-500"],
    ["warning", "text-warning-500"],
  ] as const)("%s 상태에 맞는 색상을 적용한다", (tone, colorClass) => {
    render(<Message tone={tone}>안내 메시지</Message>)

    const message = screen.getByText("안내 메시지").parentElement

    expect(message).toHaveClass("text-body-2-medium", colorClass)
    expect(message?.querySelector("svg")).toHaveAttribute("aria-hidden", "true")
  })

  it("기본 상태는 오류 스타일을 적용한다", () => {
    render(<Message>오류 메시지</Message>)

    expect(screen.getByText("오류 메시지").parentElement).toHaveClass(
      "text-error-500",
    )
  })

  it("전달한 className을 기본 스타일에 병합한다", () => {
    render(<Message className="mt-2">안내 메시지</Message>)

    expect(screen.getByText("안내 메시지").parentElement).toHaveClass("mt-2")
  })
})
