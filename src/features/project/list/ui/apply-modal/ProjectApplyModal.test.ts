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

  it("선택형 문항 값이 content이면 답변 payload에서 제외한다", () => {
    const payload = buildAnswerPayload(
      {
        "101": "두 번째",
        "102": ["A"],
      },
      sections,
    )

    expect(payload).toEqual([])
  })

  it("현재 옵션에 없는 option id는 답변 payload에서 제외한다", () => {
    const payload = buildAnswerPayload(
      {
        "101": "9999",
        "102": ["2001", "9999"],
      },
      sections,
    )

    expect(payload).toEqual([{ questionId: 102, selectedOptionIds: [2001] }])
  })

  it("비활성 섹션의 답변은 전송하지 않는다", () => {
    const payload = buildAnswerPayload(
      {
        "101": "1001",
        "102": ["2001"],
      },
      sections,
      { common: false },
    )

    expect(payload).toEqual([])
  })
})

const valueSections: Section[] = [
  {
    id: "common",
    name: "공통 문항",
    isEnabled: true,
    questions: [
      {
        id: "201",
        title: "단답",
        caption: "",
        fieldType: "text",
        required: false,
        options: [],
      },
      {
        id: "202",
        title: "파일 첨부",
        caption: "",
        fieldType: "file",
        required: false,
        options: [],
      },
      {
        id: "203",
        title: "포트폴리오",
        caption: "",
        fieldType: "portfolio",
        required: false,
        options: [],
      },
    ],
  },
]

describe("buildAnswerPayload - 값 없는 항목 제외", () => {
  it("미작성 text/file/portfolio는 bare 항목으로 전송하지 않는다", () => {
    const payload = buildAnswerPayload(
      {
        "201": "",
        "202": null,
        "203": null,
      },
      valueSections,
    )

    expect(payload).toEqual([])
  })

  it("공백만 입력한 text는 제외한다", () => {
    const payload = buildAnswerPayload({ "201": "   " }, valueSections)

    expect(payload).toEqual([])
  })

  it("값이 있는 text/file/portfolio는 정상 전송한다", () => {
    const payload = buildAnswerPayload(
      {
        "201": "답변",
        "202": { fileId: "file-1", fileName: "a.pdf" },
        "203": { kind: "link", url: "https://example.com" },
      },
      valueSections,
    )

    expect(payload).toEqual([
      { questionId: 201, textValue: "답변" },
      { questionId: 202, fileIds: ["file-1"] },
      { questionId: 203, textValue: "https://example.com" },
    ])
  })

  it("포트폴리오 파일은 fileIds로 전송한다", () => {
    const payload = buildAnswerPayload(
      { "203": { kind: "file", fileId: "pf-1", fileName: "p.pdf" } },
      valueSections,
    )

    expect(payload).toEqual([{ questionId: 203, fileIds: ["pf-1"] }])
  })
})
