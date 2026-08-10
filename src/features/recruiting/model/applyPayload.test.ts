import { describe, expect, it } from "vitest"

import { buildApplyAnswerPayload } from "./applyPayload"

import type {
  ApplicationQuestion,
  ApplicationSection,
} from "./applicationDetail"
import type { ApplyPayloadValue } from "./applyPayload"

function question(
  partial: Partial<ApplicationQuestion> &
    Pick<ApplicationQuestion, "questionId" | "type">,
): ApplicationQuestion {
  return {
    title: "문항",
    required: false,
    options: [],
    textValue: null,
    selectedOptionIds: [],
    files: [],
    ...partial,
  }
}

function section(
  sectionId: string,
  questions: ApplicationQuestion[],
): ApplicationSection {
  return { sectionId, type: "common", title: "섹션", questions }
}

const OPTIONS = [
  { optionId: "11", content: "가" },
  { optionId: "12", content: "나" },
]

const SECTIONS: ApplicationSection[] = [
  section("s1", [
    question({ questionId: "1", type: "shortText" }),
    question({ questionId: "2", type: "longText" }),
    question({ questionId: "3", type: "radio", options: OPTIONS }),
    question({ questionId: "4", type: "checkbox", options: OPTIONS }),
    question({ questionId: "5", type: "dropdown", options: OPTIONS }),
    question({ questionId: "6", type: "file" }),
    question({ questionId: "7", type: "portfolio" }),
    question({ questionId: "8", type: "schedule" }),
  ]),
]

function build(values: Record<string, ApplyPayloadValue>) {
  return buildApplyAnswerPayload(values, SECTIONS)
}

describe("buildApplyAnswerPayload", () => {
  it("텍스트 답변을 담는다", () => {
    expect(build({ "1": "  안녕  ", "2": "긴 답변" })).toEqual([
      { questionId: 1, textValue: "안녕" },
      { questionId: 2, textValue: "긴 답변" },
    ])
  })

  it("빈 텍스트는 보내지 않는다", () => {
    expect(build({ "1": "", "2": "   " })).toEqual([])
  })

  it("단일 선택은 선택지 id 하나로 담는다", () => {
    expect(build({ "3": "11", "5": "12" })).toEqual([
      { questionId: 3, selectedOptionIds: [11] },
      { questionId: 5, selectedOptionIds: [12] },
    ])
  })

  it("문항에 없는 선택지는 버린다", () => {
    expect(build({ "3": "99" })).toEqual([])
  })

  it("삭제된 선택지 자리표시자는 보내지 않는다", () => {
    expect(build({ "3": "removed-0" })).toEqual([])
  })

  it("다중 선택은 유효한 것만 모은다", () => {
    expect(build({ "4": ["11", "99", "12"] })).toEqual([
      { questionId: 4, selectedOptionIds: [11, 12] },
    ])
  })

  it("아무것도 고르지 않은 다중 선택은 보내지 않는다", () => {
    expect(build({ "4": [] })).toEqual([])
  })

  it("파일은 업로드된 fileId 로 담는다", () => {
    expect(build({ "6": { fileId: "f-1", name: "a.pdf" } })).toEqual([
      { questionId: 6, fileIds: ["f-1"] },
    ])
  })

  it("업로드 전 파일 값은 보내지 않는다", () => {
    expect(build({ "6": { name: "a.pdf" } as never })).toEqual([])
  })

  it("포트폴리오 링크는 텍스트로, 파일은 fileId 로 담는다", () => {
    expect(build({ "7": { kind: "link", url: " https://a.com " } })).toEqual([
      { questionId: 7, textValue: "https://a.com" },
    ])
    expect(
      build({ "7": { kind: "file", fileId: "f-2", name: "b.pdf" } }),
    ).toEqual([{ questionId: 7, fileIds: ["f-2"] }])
  })

  it("일정 문항은 저장 요청에 담지 않는다", () => {
    expect(build({ "8": ["2026-07-18T10:00"] })).toEqual([])
  })

  it("현재 구조에 없는 문항은 제외한다", () => {
    expect(build({ "1": "값", "999": "이전 파트 답변" })).toEqual([
      { questionId: 1, textValue: "값" },
    ])
  })

  it("null 답변은 보내지 않는다", () => {
    expect(build({ "1": null, "3": null, "6": null, "7": null })).toEqual([])
  })
})
