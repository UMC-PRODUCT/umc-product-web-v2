import { describe, expect, it } from "vitest"

import {
  buildBasicSectionUpsertRequest,
  buildCommonQuestionSectionUpsertRequest,
  makeRecruitmentQuestion,
} from "./recruitmentQuestion"

describe("recruitment question upsert payload", () => {
  it("기본 문항은 고정 섹션으로 유지한다", () => {
    const section = buildBasicSectionUpsertRequest({}, {})

    expect(section).toMatchObject({
      clientKey: "basic",
      title: "기본 문항",
      type: "COMMON",
    })
    expect(section.questions.map((question) => question.title)).toEqual([
      "신규 지원자이신가요?",
      "지원자님의 성함을 알려주세요.",
      "1지망 지원 파트를 알려주세요.",
      "2지망 지원 파트를 알려주세요.",
      "이메일 주소를 입력해 주세요.",
    ])
  })

  it("기존 서버 문항의 섹션·문항·옵션 ID를 유지한다", () => {
    const section = buildBasicSectionUpsertRequest(
      { "03": ["Design", "Web PE", "Mobile PE"] },
      {
        "03": {
          enabled: true,
          required: false,
          questionId: 13,
          optionIdsByContent: { PM: 101, Design: 102 },
          nextSectionKeysByContent: { PM: "track-PLAN" },
        },
      },
      3,
    )

    expect(section.sectionId).toBe(3)
    expect(section.questions[2]).toMatchObject({
      questionId: 13,
      required: false,
      options: [{ optionId: 101, content: "PM", nextSectionKey: "track-PLAN" }],
    })
  })

  it("공통 문항은 편집한 문항과 유형·옵션을 저장한다", () => {
    const textQuestion = makeRecruitmentQuestion({
      title: "지원 동기를 알려주세요.",
      caption: "자유롭게 작성해 주세요.",
      required: true,
    })
    const choiceQuestion = makeRecruitmentQuestion({
      fieldType: "checkbox",
      title: "관심 있는 활동을 선택해 주세요.",
      options: [{ content: "스터디" }, { content: "네트워킹" }],
    })

    expect(
      buildCommonQuestionSectionUpsertRequest(
        [textQuestion, choiceQuestion],
        7,
      ),
    ).toEqual({
      sectionId: 7,
      clientKey: "common",
      title: "공통 문항",
      type: "COMMON",
      questions: [
        {
          type: "SHORT_TEXT",
          title: "지원 동기를 알려주세요.",
          description: "자유롭게 작성해 주세요.",
          required: true,
          options: undefined,
        },
        {
          type: "CHECKBOX",
          title: "관심 있는 활동을 선택해 주세요.",
          description: undefined,
          required: false,
          options: [
            { content: "스터디", other: false },
            { content: "네트워킹", other: false },
          ],
        },
      ],
    })
  })

  it("공통 문항을 모두 삭제하면 빈 COMMON 섹션을 저장한다", () => {
    expect(buildCommonQuestionSectionUpsertRequest([], 8)).toMatchObject({
      sectionId: 8,
      clientKey: "common",
      title: "공통 문항",
      type: "COMMON",
      questions: [],
    })
  })
})
