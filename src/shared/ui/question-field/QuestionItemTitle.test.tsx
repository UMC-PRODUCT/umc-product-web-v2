import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { QuestionItemTitle } from "./QuestionItemTitle"

describe("QuestionItemTitle", () => {
  it("caption이 있으면 제목 아래 설명을 표시한다", () => {
    render(
      <QuestionItemTitle index="Q1" title="지원 동기" caption="500자 이내" />,
    )

    expect(screen.getByText("지원 동기")).toBeInTheDocument()
    expect(screen.getByText("500자 이내")).toBeInTheDocument()
  })

  it("caption이 빈 문자열이거나 없으면 설명을 렌더하지 않는다", () => {
    const { rerender } = render(
      <QuestionItemTitle index="Q1" title="지원 동기" caption="보이는 설명" />,
    )
    expect(screen.getByText("보이는 설명")).toBeInTheDocument()

    rerender(<QuestionItemTitle index="Q1" title="지원 동기" caption="" />)
    expect(screen.queryByText("보이는 설명")).not.toBeInTheDocument()
    expect(screen.getByText("지원 동기")).toBeInTheDocument()

    rerender(<QuestionItemTitle index="Q1" title="지원 동기" />)
    expect(screen.queryByText("보이는 설명")).not.toBeInTheDocument()
  })
})
