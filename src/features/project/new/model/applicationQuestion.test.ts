import { describe, expect, it } from "vitest"

import { getFieldTypePatch, PORTFOLIO_FIXED_TITLE } from "./applicationQuestion"

import type { Question } from "./applicationQuestion"

const baseQuestion: Question = {
  id: "q-1",
  title: "질문 제목",
  caption: "질문 설명",
  fieldType: "text",
  required: false,
  options: [],
}

describe("getFieldTypePatch", () => {
  it("포트폴리오 전환 후 기존 타입으로 돌아오면 제목을 복원", () => {
    const portfolioPatch = getFieldTypePatch("portfolio", baseQuestion)
    const portfolioQuestion = { ...baseQuestion, ...portfolioPatch }
    const textPatch = getFieldTypePatch("text", portfolioQuestion)

    expect(portfolioPatch.title).toBe(PORTFOLIO_FIXED_TITLE)
    expect(textPatch.title).toBe(baseQuestion.title)
  })

  it("단일 선택에서 복수 선택으로 전환해도 옵션을 유지", () => {
    const question: Question = {
      ...baseQuestion,
      fieldType: "radio",
      options: [{ content: "옵션 A" }, { content: "옵션 B" }],
    }

    const patch = getFieldTypePatch("checkbox", question)

    expect(patch.options).toEqual(question.options)
  })

  it("선택형에서 텍스트로 전환했다가 다시 선택형으로 돌아오면 옵션을 복원", () => {
    const question: Question = {
      ...baseQuestion,
      fieldType: "radio",
      options: [{ content: "옵션 A" }, { content: "옵션 B" }],
    }
    const textQuestion = { ...question, ...getFieldTypePatch("text", question) }
    const checkboxPatch = getFieldTypePatch("checkbox", textQuestion)

    expect(textQuestion.options).toEqual([])
    expect(checkboxPatch.options).toEqual(question.options)
  })

  it("선택형에서 텍스트로 전환해도 제목과 설명은 유지", () => {
    const question: Question = {
      ...baseQuestion,
      fieldType: "checkbox",
      options: [{ content: "옵션 A" }],
    }

    const patch = getFieldTypePatch("text", question)

    expect(patch.title).toBeUndefined()
    expect(patch.caption).toBeUndefined()
  })
})
