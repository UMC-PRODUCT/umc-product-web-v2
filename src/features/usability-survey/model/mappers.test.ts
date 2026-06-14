import { describe, expect, it } from "vitest"

import { resolveVariantKey, toAnswerItems } from "./mappers"
import { getScaleTextKey } from "./types"
import { SURVEY_VARIANTS } from "./variants"

import type { FeedbackForm } from "../api/types"
import type { SurveyAnswers } from "./types"

// dev 서버 APPLICATION_SUBMITTED (template 1) 응답 기반
const applyForm: FeedbackForm = {
  formId: 2,
  sections: [
    {
      sectionId: 2,
      orderNo: 1,
      questions: [
        {
          questionId: 2,
          type: "RADIO",
          orderNo: 1,
          options: [
            { optionId: 2, content: "쉬움", orderNo: 1 },
            { optionId: 3, content: "조금 쉬움", orderNo: 2 },
            { optionId: 4, content: "보통", orderNo: 3 },
            { optionId: 5, content: "조금 어려움", orderNo: 4 },
            { optionId: 6, content: "어려움", orderNo: 5 },
          ],
        },
        {
          questionId: 3,
          type: "RADIO",
          orderNo: 2,
          options: [
            { optionId: 7, content: "만족스러워요", orderNo: 1 },
            { optionId: 8, content: "아쉬워요", orderNo: 2 },
          ],
        },
        { questionId: 4, type: "LONG_TEXT", orderNo: 3, options: [] },
        { questionId: 5, type: "LONG_TEXT", orderNo: 4, options: [] },
      ],
    },
  ],
}

// dev 서버 APPLICATION_MONITORING (template 5, ADMIN) 응답 기반
const adminForm: FeedbackForm = {
  formId: 6,
  sections: [
    {
      sectionId: 6,
      orderNo: 1,
      questions: [
        {
          questionId: 20,
          type: "RADIO",
          orderNo: 1,
          options: [
            { optionId: 34, content: "쉬움", orderNo: 1 },
            { optionId: 35, content: "조금 쉬움", orderNo: 2 },
            { optionId: 36, content: "보통", orderNo: 3 },
            { optionId: 37, content: "조금 어려움", orderNo: 4 },
            { optionId: 38, content: "어려움", orderNo: 5 },
          ],
        },
        {
          questionId: 21,
          type: "RADIO",
          orderNo: 2,
          options: [
            { optionId: 39, content: "전보다 편해요", orderNo: 1 },
            { optionId: 40, content: "전보다 불편해요", orderNo: 2 },
          ],
        },
        {
          questionId: 22,
          type: "RADIO",
          orderNo: 3,
          options: [
            { optionId: 41, content: "전혀 없었어요", orderNo: 1 },
            { optionId: 42, content: "조금 있었어요", orderNo: 2 },
            { optionId: 43, content: "많이 있었어요", orderNo: 3 },
          ],
        },
        { questionId: 23, type: "LONG_TEXT", orderNo: 4, options: [] },
        {
          questionId: 24,
          type: "RADIO",
          orderNo: 5,
          options: [
            { optionId: 44, content: "좋아요", orderNo: 1 },
            { optionId: 45, content: "아니요", orderNo: 2 },
          ],
        },
        { questionId: 25, type: "LONG_TEXT", orderNo: 6, options: [] },
        {
          questionId: 26,
          type: "RADIO",
          orderNo: 7,
          options: [
            { optionId: 46, content: "공지 작성", orderNo: 1 },
            { optionId: 47, content: "프로젝트 목록 및 정보 확인", orderNo: 2 },
            { optionId: 48, content: "지원 현황", orderNo: 3 },
            { optionId: 49, content: "매칭 현황", orderNo: 4 },
            { optionId: 50, content: "매칭 차수 설정", orderNo: 5 },
            { optionId: 51, content: "기타", orderNo: 6, isOther: true },
          ],
        },
        { questionId: 27, type: "LONG_TEXT", orderNo: 8, options: [] },
      ],
    },
  ],
}

describe("resolveVariantKey", () => {
  it("context와 targetType 조합을 variant 키로 매핑한다", () => {
    expect(resolveVariantKey("APPLICATION_SUBMITTED", "NEW_CHALLENGER")).toBe(
      "new-gisu-general-apply",
    )
    expect(
      resolveVariantKey("APPLICATION_SUBMITTED", "EXPERIENCED_CHALLENGER"),
    ).toBe("prev-gisu-general-apply")
    expect(resolveVariantKey("MATCHING_COMPLETED", "NEW_CHALLENGER")).toBe(
      "new-gisu-general-matching",
    )
    expect(
      resolveVariantKey("MATCHING_COMPLETED", "EXPERIENCED_CHALLENGER"),
    ).toBe("prev-gisu-general-matching")
    expect(resolveVariantKey("APPLICATION_MONITORING", "ADMIN")).toBe(
      "admin-matching",
    )
  })

  it("대응되지 않는 조합은 null을 반환한다", () => {
    expect(resolveVariantKey("APPLICATION_SUBMITTED", "ADMIN")).toBeNull()
    expect(
      resolveVariantKey("APPLICATION_MONITORING", "NEW_CHALLENGER"),
    ).toBeNull()
    expect(resolveVariantKey(undefined, undefined)).toBeNull()
  })
})

describe("toAnswerItems", () => {
  it("scale/choice/text 답변을 서버 answer 포맷으로 변환한다", () => {
    const answers: SurveyAnswers = {
      difficulty: 4,
      "apply-process": "positive",
      feedback: "좋았어요",
      extra: "",
    }

    const result = toAnswerItems(
      SURVEY_VARIANTS["new-gisu-general-apply"],
      applyForm,
      answers,
    )

    expect(result).toEqual([
      { questionId: 2, selectedOptionIds: [3] },
      { questionId: 3, selectedOptionIds: [7] },
      { questionId: 4, textValue: "좋았어요" },
    ])
  })

  it("scale 값을 scores 인덱스로 옵션과 매핑한다", () => {
    const result = toAnswerItems(
      SURVEY_VARIANTS["new-gisu-general-apply"],
      applyForm,
      { difficulty: 1, "apply-process": "negative" },
    )

    expect(result).toContainEqual({ questionId: 2, selectedOptionIds: [6] })
    expect(result).toContainEqual({ questionId: 3, selectedOptionIds: [8] })
  })

  it("admin variant의 scale-with-text 분리와 single-select를 매핑한다", () => {
    const answers: SurveyAnswers = {
      difficulty: 5,
      "matching-process": "negative",
      "info-difficulty": 3,
      [getScaleTextKey("info-difficulty")]: "정보 부족",
      reuse: "positive",
      feedback: "",
      "worst-step": "matching-status",
      extra: "끝",
    }

    const result = toAnswerItems(
      SURVEY_VARIANTS["admin-matching"],
      adminForm,
      answers,
    )

    expect(result).toEqual([
      { questionId: 20, selectedOptionIds: [34] },
      { questionId: 21, selectedOptionIds: [40] },
      { questionId: 22, selectedOptionIds: [42] },
      { questionId: 23, textValue: "정보 부족" },
      { questionId: 24, selectedOptionIds: [44] },
      { questionId: 26, selectedOptionIds: [49] },
      { questionId: 27, textValue: "끝" },
    ])
  })

  it("문자열로 직렬화된 id를 number로 정규화한다", () => {
    const stringIdForm = {
      formId: "2",
      sections: [
        {
          sectionId: "2",
          orderNo: "1",
          questions: [
            {
              questionId: "2",
              type: "RADIO",
              orderNo: "1",
              options: [
                { optionId: "2", content: "쉬움", orderNo: "1" },
                { optionId: "3", content: "조금 쉬움", orderNo: "2" },
                { optionId: "4", content: "보통", orderNo: "3" },
                { optionId: "5", content: "조금 어려움", orderNo: "4" },
                { optionId: "6", content: "어려움", orderNo: "5" },
              ],
            },
            {
              questionId: "3",
              type: "RADIO",
              orderNo: "2",
              options: [
                { optionId: "7", content: "만족스러워요", orderNo: "1" },
                { optionId: "8", content: "아쉬워요", orderNo: "2" },
              ],
            },
            { questionId: "4", type: "LONG_TEXT", orderNo: "3", options: [] },
            { questionId: "5", type: "LONG_TEXT", orderNo: "4", options: [] },
          ],
        },
      ],
    } as unknown as FeedbackForm

    const result = toAnswerItems(
      SURVEY_VARIANTS["new-gisu-general-apply"],
      stringIdForm,
      { difficulty: 4, "apply-process": "positive" },
    )

    expect(result).toEqual([
      { questionId: 2, selectedOptionIds: [3] },
      { questionId: 3, selectedOptionIds: [7] },
    ])
  })

  it("슬롯과 서버 질문 개수가 다르면 예외를 던진다", () => {
    const brokenForm: FeedbackForm = {
      formId: 2,
      sections: [
        {
          sectionId: 2,
          orderNo: 1,
          questions: [
            { questionId: 2, type: "RADIO", orderNo: 1, options: [] },
          ],
        },
      ],
    }

    expect(() =>
      toAnswerItems(SURVEY_VARIANTS["new-gisu-general-apply"], brokenForm, {}),
    ).toThrow()
  })
})
