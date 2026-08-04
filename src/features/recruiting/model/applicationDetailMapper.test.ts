import { describe, expect, it } from "vitest"

import {
  toApplicationDetail,
  toApplicationSections,
  toReachedStages,
  toRecruitmentLabel,
} from "./applicationDetailMapper"

import type {
  RecruitingApplicationAnswer,
  RecruitingApplicationSummary,
  RecruitingFormQuestion,
  RecruitingFormStructure,
} from "../api/types"

function question(
  overrides: Partial<RecruitingFormQuestion> & { questionId: string },
): RecruitingFormQuestion {
  return {
    title: "질문",
    description: null,
    type: "SHORT_TEXT",
    required: false,
    orderNo: 1,
    options: [],
    ...overrides,
  }
}

function structure(
  sections: RecruitingFormStructure["sections"],
): RecruitingFormStructure {
  return { formId: "1", title: "지원서", description: null, sections }
}

const CHOICES = {
  firstChoice: "WEB_PRODUCT_ENGINEER",
  secondChoice: null,
} satisfies Pick<RecruitingApplicationSummary, "firstChoice" | "secondChoice">

function summary(
  overrides: Partial<RecruitingApplicationSummary> = {},
): RecruitingApplicationSummary {
  return {
    applicationId: "500",
    applicantName: "김지원",
    email: "a@b.com",
    applicantMemberId: "9",
    firstChoice: "WEB_PRODUCT_ENGINEER",
    secondChoice: null,
    acceptedTrack: null,
    status: "SUBMITTED",
    registrationStatus: "NOT_READY",
    submittedAt: "2026-07-20T10:00:00",
    documentEvaluatedByMe: false,
    interviewEvaluatedByMe: false,
    ...overrides,
  }
}

describe("toApplicationSections", () => {
  // 문항 타입은 답변을 받은 뒤에도 바뀔 수 있다. 서버가 답변 시점의 타입을 함께
  // 주므로 그것을 우선해야, 타입이 바뀐 뒤에도 예전 답변이 화면에 남는다.
  it("답변에 실린 타입을 문항의 현재 타입보다 우선한다", () => {
    const sections = toApplicationSections(
      structure([
        {
          sectionId: "1",
          title: "기본 문항",
          description: null,
          orderNo: 1,
          questions: [
            question({ questionId: "10", type: "CHECKBOX", orderNo: 1 }),
          ],
        },
      ]),
      [
        {
          questionId: "10",
          type: "LONG_TEXT",
          textValue: "서술형으로 적었던 답변",
          selectedOptionIds: [],
          fileIds: [],
          times: [],
        },
      ],
      CHOICES,
    )

    const answered = sections[0]?.questions[0]
    expect(answered?.type).toBe("longText")
    expect(answered?.textValue).toBe("서술형으로 적었던 답변")
  })

  it("답변에 타입이 없으면 문항의 타입을 쓴다", () => {
    const sections = toApplicationSections(
      structure([
        {
          sectionId: "1",
          title: "기본 문항",
          description: null,
          orderNo: 1,
          questions: [
            question({ questionId: "10", type: "LONG_TEXT", orderNo: 1 }),
          ],
        },
      ]),
      [
        {
          questionId: "10",
          textValue: "답변",
          selectedOptionIds: [],
          fileIds: [],
          times: [],
        },
      ],
      CHOICES,
    )

    expect(sections[0]?.questions[0]?.type).toBe("longText")
  })

  it("questionId 로 답변을 문항에 붙인다", () => {
    const sections = toApplicationSections(
      structure([
        {
          sectionId: "1",
          title: "기본 문항",
          description: null,
          orderNo: 1,
          questions: [
            question({ questionId: "10", title: "이름", orderNo: 1 }),
            question({ questionId: "11", title: "각오", orderNo: 2 }),
          ],
        },
      ]),
      [
        {
          questionId: "11",
          textValue: "열심히",
          selectedOptionIds: [],
          fileIds: [],
          times: [],
        },
        {
          questionId: "10",
          textValue: "김지원",
          selectedOptionIds: [],
          fileIds: [],
          times: [],
        },
      ],
      CHOICES,
    )

    expect(sections[0]?.questions.map((q) => q.textValue)).toEqual([
      "김지원",
      "열심히",
    ])
  })

  it("답변이 없는 문항도 빈 값으로 남긴다", () => {
    const sections = toApplicationSections(
      structure([
        {
          sectionId: "1",
          title: "기본 문항",
          description: null,
          orderNo: 1,
          questions: [question({ questionId: "10" })],
        },
      ]),
      [],
      CHOICES,
    )

    expect(sections[0]?.questions[0]).toMatchObject({
      textValue: null,
      selectedOptionIds: [],
      files: [],
    })
  })

  it("id 가 숫자로 와도 선택지 답변이 매칭된다", () => {
    const answers = [
      {
        questionId: 10 as unknown as string,
        textValue: null,
        selectedOptionIds: [104 as unknown as string],
        fileIds: [],
        times: [],
      },
    ] satisfies RecruitingApplicationAnswer[]

    const sections = toApplicationSections(
      structure([
        {
          sectionId: "1",
          title: "기본 문항",
          description: null,
          orderNo: 1,
          questions: [
            question({
              questionId: 10 as unknown as string,
              type: "RADIO",
              options: [
                {
                  optionId: "104",
                  content: "예",
                  orderNo: 1,
                  other: false,
                  nextSectionId: null,
                },
                {
                  optionId: "105",
                  content: "아니오",
                  orderNo: 2,
                  other: false,
                  nextSectionId: null,
                },
              ],
            }),
          ],
        },
      ]),
      answers,
      CHOICES,
    )

    expect(sections[0]?.questions[0]?.selectedOptionIds).toEqual(["104"])
  })

  it("선택지 답변이 객체 배열로 와도 매칭된다", () => {
    const sections = toApplicationSections(
      structure([
        {
          sectionId: "1",
          title: "기본 문항",
          description: null,
          orderNo: 1,
          questions: [
            question({
              questionId: "10",
              type: "CHECKBOX",
              options: [
                {
                  optionId: "104",
                  content: "예",
                  orderNo: 1,
                  other: false,
                  nextSectionId: null,
                },
                {
                  optionId: "105",
                  content: "아니오",
                  orderNo: 2,
                  other: false,
                  nextSectionId: null,
                },
              ],
            }),
          ],
        },
      ]),
      [
        {
          questionId: "10",
          textValue: null,
          selectedOptions: [
            { questionOptionId: "105", answeredAsContent: "아니오" },
          ],
          fileIds: [],
          times: [],
        },
      ],
      CHOICES,
    )

    expect(sections[0]?.questions[0]?.selectedOptionIds).toEqual(["105"])
  })

  it("폼에서 지워진 선택지도 응답 시점 내용으로 되살린다", () => {
    const sections = toApplicationSections(
      structure([
        {
          sectionId: "1",
          title: "기본 문항",
          description: null,
          orderNo: 1,
          questions: [
            question({
              questionId: "10",
              type: "CHECKBOX",
              options: [
                {
                  optionId: "7",
                  content: "남은 선택지",
                  orderNo: 1,
                  other: false,
                  nextSectionId: null,
                },
              ],
            }),
          ],
        },
      ]),
      [
        {
          questionId: "10",
          textValue: null,
          selectedOptions: [
            { questionOptionId: null, answeredAsContent: "지워진 선택지" },
            { questionOptionId: "7", answeredAsContent: "남은 선택지" },
          ],
          fileIds: [],
          times: [],
        },
      ],
      CHOICES,
    )

    const target = sections[0]?.questions[0]
    expect(target?.options.map((option) => option.content)).toEqual([
      "남은 선택지",
      "지워진 선택지",
    ])
    expect(target?.selectedOptionIds).toHaveLength(2)
    const removed = target?.options.find(
      (option) => option.content === "지워진 선택지",
    )
    expect(target?.selectedOptionIds).toContain(removed?.optionId)
  })

  it("내용조차 없는 선택 항목은 버린다", () => {
    const sections = toApplicationSections(
      structure([
        {
          sectionId: "1",
          title: "기본 문항",
          description: null,
          orderNo: 1,
          questions: [question({ questionId: "10", type: "CHECKBOX" })],
        },
      ]),
      [
        {
          questionId: "10",
          textValue: null,
          selectedOptions: [{ questionOptionId: null, answeredAsContent: "" }],
          fileIds: [],
          times: [],
        },
      ],
      CHOICES,
    )

    expect(sections[0]?.questions[0]?.selectedOptionIds).toEqual([])
    expect(sections[0]?.questions[0]?.options).toEqual([])
  })

  it("섹션과 선택지를 orderNo 순으로 정렬한다", () => {
    const sections = toApplicationSections(
      structure([
        {
          sectionId: "2",
          title: "나중",
          description: null,
          orderNo: 2,
          questions: [],
        },
        {
          sectionId: "1",
          title: "먼저",
          description: null,
          orderNo: 1,
          questions: [
            question({
              questionId: "10",
              type: "CHECKBOX",
              options: [
                {
                  optionId: "2",
                  content: "B",
                  orderNo: 2,
                  other: false,
                  nextSectionId: null,
                },
                {
                  optionId: "1",
                  content: "A",
                  orderNo: 1,
                  other: false,
                  nextSectionId: null,
                },
              ],
            }),
          ],
        },
      ]),
      [],
      CHOICES,
    )

    expect(sections.map((section) => section.title)).toEqual(["먼저", "나중"])
    expect(
      sections[0]?.questions[0]?.options.map((option) => option.content),
    ).toEqual(["A", "B"])
  })

  it("지원 트랙 라벨이 들어간 섹션을 파트 섹션으로 본다", () => {
    const sections = toApplicationSections(
      structure([
        {
          sectionId: "1",
          title: "기본 문항",
          description: null,
          orderNo: 1,
          questions: [],
        },
        {
          sectionId: "2",
          title: "Web PE 파트 문항",
          description: null,
          orderNo: 2,
          questions: [],
        },
      ]),
      [],
      CHOICES,
    )

    expect(sections.map((section) => section.type)).toEqual(["common", "part"])
  })

  it("SCHEDULE 문항은 선택한 일정을 텍스트로 보여준다", () => {
    const sections = toApplicationSections(
      structure([
        {
          sectionId: "1",
          title: "면접 일정",
          description: null,
          orderNo: 1,
          questions: [question({ questionId: "10", type: "SCHEDULE" })],
        },
      ]),
      [
        {
          questionId: "10",
          textValue: null,
          selectedOptionIds: [],
          fileIds: [],
          times: ["2026-07-28T14:00:00"],
        },
      ],
      CHOICES,
    )

    expect(sections[0]?.questions[0]?.type).toBe("schedule")
    expect(sections[0]?.questions[0]?.textValue).toBe("26-07-28 14:00")
  })

  it("첨부 파일은 이름만 만들고 링크를 걸지 않는다", () => {
    const sections = toApplicationSections(
      structure([
        {
          sectionId: "1",
          title: "포트폴리오",
          description: null,
          orderNo: 1,
          questions: [question({ questionId: "10", type: "FILE" })],
        },
      ]),
      [
        {
          questionId: "10",
          textValue: null,
          selectedOptionIds: [],
          fileIds: ["f1", "f2"],
          times: [],
        },
      ],
      CHOICES,
    )

    expect(sections[0]?.questions[0]?.files).toEqual([
      { fileId: "f1", name: "첨부파일 1", url: null },
      { fileId: "f2", name: "첨부파일 2", url: null },
    ])
  })
})

describe("toReachedStages", () => {
  it("서류 심사 중이면 서류 단계만 노출한다", () => {
    expect(toReachedStages(summary({ status: "SUBMITTED" }), true)).toEqual([
      "document",
    ])
  })

  it("서류 불합격이면 이후 단계를 노출하지 않는다", () => {
    expect(
      toReachedStages(summary({ status: "DOCUMENT_FAILED" }), true),
    ).toEqual(["document"])
  })

  it("면접 대상자는 면접 단계까지 노출한다", () => {
    expect(
      toReachedStages(summary({ status: "INTERVIEW_ASSIGNED" }), true),
    ).toEqual(["document", "interview"])
  })

  it("최종 결과가 나오면 최종 단계까지 노출한다", () => {
    expect(toReachedStages(summary({ status: "FINAL_PASSED" }), true)).toEqual([
      "document",
      "interview",
      "final",
    ])
  })

  it("면접을 건너뛴 지원자는 면접 단계를 노출하지 않는다", () => {
    expect(
      toReachedStages(summary({ status: "INTERVIEW_SKIPPED" }), true),
    ).toEqual(["document", "final"])
  })

  it("면접이 없는 모집은 면접 단계를 건너뛴다", () => {
    expect(toReachedStages(summary({ status: "FINAL_PASSED" }), false)).toEqual(
      ["document", "final"],
    )
    expect(
      toReachedStages(summary({ status: "INTERVIEW_ASSIGNED" }), false),
    ).toEqual(["document"])
  })
})

describe("toRecruitmentLabel", () => {
  it("본 모집과 추가 모집을 구분한다", () => {
    expect(toRecruitmentLabel({ type: "REGULAR", roundNo: 1 })).toBe("본 모집")
    expect(toRecruitmentLabel({ type: "ADDITIONAL", roundNo: 2 })).toBe(
      "2차 추가 모집",
    )
  })
})

describe("toApplicationDetail", () => {
  it("지부·학교와 지원 파트를 차수 정보에서 채운다", () => {
    const detail = toApplicationDetail(
      summary({ status: "FINAL_PASSED", secondChoice: "PLAN" }),
      [],
      { chapterName: "서울", schoolName: "중앙대학교" },
      { type: "REGULAR", roundNo: 1, interviewRequired: true },
    )

    expect(detail).toMatchObject({
      applicationId: "500",
      applicantName: "김지원",
      chapter: "서울",
      school: "중앙대학교",
      recruitmentLabel: "본 모집",
      parts: ["web-pe", "pm"],
      finalResult: "pass",
    })
  })
})
