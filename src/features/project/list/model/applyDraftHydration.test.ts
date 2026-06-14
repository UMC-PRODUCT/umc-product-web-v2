import { describe, expect, it } from "vitest"

import { buildFormValuesFromDetail } from "./applyDraftHydration"

import type { Section } from "@/features/project/new/model/applicationQuestion"

import type { AnswerView, ApplicationDetail } from "../api/matchingProject"

const sections: Section[] = [
  {
    id: "common",
    name: "공통 문항",
    isEnabled: true,
    questions: [
      {
        id: "101",
        title: "자기소개",
        caption: "",
        fieldType: "text",
        required: true,
        options: [],
      },
      {
        id: "102",
        title: "단일 선택",
        caption: "",
        fieldType: "radio",
        required: true,
        options: [
          { content: "A", optionId: 1001 },
          { content: "B", optionId: 1002 },
        ],
      },
      {
        id: "103",
        title: "복수 선택",
        caption: "",
        fieldType: "checkbox",
        required: false,
        options: [
          { content: "C", optionId: 2001 },
          { content: "D", optionId: 2002 },
        ],
      },
      {
        id: "104",
        title: "파일",
        caption: "",
        fieldType: "file",
        required: false,
        options: [],
      },
      {
        id: "105",
        title: "포트폴리오",
        caption: "",
        fieldType: "portfolio",
        required: false,
        options: [],
      },
    ],
  },
]

function detailWith(answers: Record<string, AnswerView>): ApplicationDetail {
  return {
    applicationId: "9",
    applicant: {
      memberId: "1",
      nickname: "n",
      name: "이름",
      schoolName: "학교",
      part: "WEB",
    },
    matchingRound: { id: "1", type: "REGULAR", phase: "OPEN" },
    status: "DRAFT",
    formResponse: {
      formResponseId: "1",
      formId: "1",
      status: "DRAFT",
      sections: [
        {
          sectionId: "common",
          type: "COMMON",
          allowedParts: [],
          title: "공통 문항",
          orderNo: "1",
          questions: Object.entries(answers).map(([questionId, answer]) => ({
            questionId,
            type: answer.answeredAsType,
            title: "",
            isRequired: false,
            orderNo: "1",
            options: [],
            answer,
          })),
        },
      ],
    },
  } as ApplicationDetail
}

describe("buildFormValuesFromDetail", () => {
  it("저장된 답변을 폼 값으로 역매핑한다", () => {
    const detail = detailWith({
      "101": {
        answerId: "1",
        answeredAsType: "LONG_TEXT",
        textValue: "안녕하세요",
      },
      "102": {
        answerId: "2",
        answeredAsType: "RADIO",
        selectedOptions: [{ questionOptionId: "1002", answeredAsContent: "B" }],
      },
      "103": {
        answerId: "3",
        answeredAsType: "CHECKBOX",
        selectedOptions: [
          { questionOptionId: "2001", answeredAsContent: "C" },
          { questionOptionId: "2002", answeredAsContent: "D" },
        ],
      },
      "104": {
        answerId: "4",
        answeredAsType: "FILE",
        files: [
          { fileId: "f1", originalFileName: "a.pdf", url: "http://x/a.pdf" },
        ],
      },
      "105": {
        answerId: "5",
        answeredAsType: "PORTFOLIO",
        textValue: "https://github.com/me",
      },
    })

    const values = buildFormValuesFromDetail(detail, sections)

    expect(values["101"]).toBe("안녕하세요")
    expect(values["102"]).toBe("1002")
    expect(values["103"]).toEqual(["2001", "2002"])
    expect(values["104"]).toEqual({ fileId: "f1", fileName: "a.pdf" })
    expect(values["105"]).toEqual({
      kind: "link",
      url: "https://github.com/me",
    })
  })

  it("포트폴리오 파일 답변은 file 종류로 매핑한다", () => {
    const detail = detailWith({
      "105": {
        answerId: "5",
        answeredAsType: "PORTFOLIO",
        files: [
          {
            fileId: "p1",
            originalFileName: "port.pdf",
            url: "http://x/port.pdf",
          },
        ],
      },
    })

    const values = buildFormValuesFromDetail(detail, sections)

    expect(values["105"]).toEqual({
      kind: "file",
      fileId: "p1",
      fileName: "port.pdf",
    })
  })

  it("답변이 없는 문항은 fieldType별 기본값을 채운다", () => {
    const values = buildFormValuesFromDetail(detailWith({}), sections)

    expect(values["101"]).toBe("")
    expect(values["102"]).toBe("")
    expect(values["103"]).toEqual([])
    expect(values["104"]).toBeNull()
    expect(values["105"]).toBeNull()
  })
})
