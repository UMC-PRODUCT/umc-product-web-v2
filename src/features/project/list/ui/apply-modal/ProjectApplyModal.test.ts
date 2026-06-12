import { describe, expect, it } from "vitest"

import { buildAnswerPayload } from "../../model/applyAnswerPayload"

import type { Section } from "@/features/project/new/model/applicationQuestion"

const sections: Section[] = [
  {
    id: "common",
    name: "공통 문항",
    isEnabled: true,
    questions: [
      {
        id: "101",
        title: "단일 선택",
        caption: "",
        fieldType: "radio",
        required: true,
        options: [
          { content: "첫 번째", optionId: 1001 },
          { content: "두 번째", optionId: 1002 },
        ],
      },
      {
        id: "102",
        title: "복수 선택",
        caption: "",
        fieldType: "checkbox",
        required: true,
        options: [
          { content: "A", optionId: 2001 },
          { content: "B", optionId: 2002 },
          { content: "C", optionId: 2003 },
        ],
      },
    ],
  },
]

describe("buildAnswerPayload", () => {
  it("선택형 문항은 content 대신 option id를 selectedOptionIds로 전송한다", () => {
    const payload = buildAnswerPayload(
      {
        "101": "1002",
        "102": ["2001", "2003"],
      },
      sections,
    )

    expect(payload).toEqual([
      { questionId: 101, selectedOptionIds: [1002] },
      { questionId: 102, selectedOptionIds: [2001, 2003] },
    ])
  })

  it("선택형 문항 값이 content이면 selectedOptionIds에 포함하지 않는다", () => {
    const payload = buildAnswerPayload(
      {
        "101": "두 번째",
        "102": ["A"],
      },
      sections,
    )

    expect(payload).toEqual([{ questionId: 101 }, { questionId: 102 }])
  })

  it("현재 옵션에 없는 option id는 selectedOptionIds에 포함하지 않는다", () => {
    const payload = buildAnswerPayload(
      {
        "101": "9999",
        "102": ["2001", "9999"],
      },
      sections,
    )

    expect(payload).toEqual([
      { questionId: 101 },
      { questionId: 102, selectedOptionIds: [2001] },
    ])
  })
})
