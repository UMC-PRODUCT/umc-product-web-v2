import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { TextQuestionField } from "./TextQuestionField"

const HOVER_CLASS = "data-[state=default]:hover:border-teal-400"

function renderField(
  props: Partial<React.ComponentProps<typeof TextQuestionField>> = {},
) {
  render(
    <TextQuestionField
      value=""
      onChange={vi.fn()}
      ariaLabel="코멘트"
      {...props}
    />,
  )
  const textarea = screen.getByLabelText("코멘트")
  return { textarea, box: textarea.closest("[data-state]") as HTMLElement }
}

describe("TextQuestionField", () => {
  it("disabled를 textarea와 컨테이너 상태에 함께 전달한다", () => {
    const { textarea, box } = renderField({ value: "내용", disabled: true })

    expect(textarea).toBeDisabled()
    expect(box).toHaveAttribute("data-state", "disabled")
  })

  it("disabled면 hover 스타일을 적용하지 않는다", () => {
    const { box } = renderField({ disabled: true })

    expect(box).not.toHaveClass(HOVER_CLASS)
  })

  it("활성 상태에서는 hover 스타일을 적용한다", () => {
    const { box } = renderField()

    expect(box).toHaveClass(HOVER_CLASS)
  })

  it("포커스 전에는 카운터를 노출하지 않는다", () => {
    renderField({ value: "abc", maxLength: 100 })

    expect(screen.queryByText("/")).not.toBeInTheDocument()
  })

  it("포커스하면 카운터를 노출한다", () => {
    const { textarea } = renderField({ value: "abc", maxLength: 100 })

    fireEvent.focus(textarea)

    expect(screen.getByText("/")).toBeInTheDocument()
    expect(screen.getByText("3")).toBeInTheDocument()
  })

  it("disabled면 포커스해도 카운터를 노출하지 않는다", () => {
    const { textarea } = renderField({
      value: "abc",
      maxLength: 100,
      disabled: true,
    })

    fireEvent.focus(textarea)

    expect(screen.queryByText("/")).not.toBeInTheDocument()
  })
})
