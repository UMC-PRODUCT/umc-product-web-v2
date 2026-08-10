import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { QuestionFieldBox, type QuestionFieldState } from "./QuestionFieldBox"

function renderBox(props: {
  state?: QuestionFieldState
  interactive?: boolean
}) {
  render(
    <QuestionFieldBox {...props}>
      <span>내용</span>
    </QuestionFieldBox>,
  )
  return screen.getByText("내용").parentElement as HTMLElement
}

describe("QuestionFieldBox", () => {
  it("interactive를 주지 않으면 hover 스타일을 적용하지 않는다", () => {
    const box = renderBox({})

    expect(box).not.toHaveClass("data-[state=default]:hover:border-teal-400")
    expect(box).not.toHaveClass("data-[state=filled]:hover:border-teal-400")
  })

  it("interactive를 주면 default와 filled에서만 hover 스타일을 적용한다", () => {
    const box = renderBox({ interactive: true })

    expect(box).toHaveClass(
      "data-[state=default]:hover:border-teal-400",
      "data-[state=filled]:hover:border-teal-400",
    )
  })

  it("disabled 상태의 테두리 토큰을 적용한다", () => {
    const box = renderBox({ state: "disabled" })

    expect(box).toHaveAttribute("data-state", "disabled")
    expect(box).toHaveClass("data-[state=disabled]:border-teal-gray-200")
  })

  it.each(["default", "focus", "filled", "error", "disabled"] as const)(
    "%s 상태를 data-state로 노출한다",
    (state) => {
      const box = renderBox({ state })

      expect(box).toHaveAttribute("data-state", state)
    },
  )
})
