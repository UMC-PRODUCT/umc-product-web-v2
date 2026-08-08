import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { QuestionForm } from "./QuestionForm"
import { TextQuestionField } from "./TextQuestionField"

describe("QuestionForm", () => {
  it("포커스된 문항에서 설명 입력과 답변 placeholder를 제공한다", () => {
    render(
      <QuestionForm
        index="01"
        title="지원 동기를 알려주세요."
        caption=""
        focused
        required
        onTitleChange={vi.fn()}
        onCaptionChange={vi.fn()}
        onRequiredChange={vi.fn()}
        onDelete={vi.fn()}
      >
        <TextQuestionField value="" onChange={vi.fn()} />
      </QuestionForm>,
    )

    expect(screen.getByLabelText("문항 설명")).toHaveAttribute(
      "placeholder",
      "설명을 입력하세요",
    )
    expect(
      screen.getByPlaceholderText("답변을 작성하세요."),
    ).toBeInTheDocument()
  })
})
