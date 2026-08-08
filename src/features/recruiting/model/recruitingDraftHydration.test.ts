import { describe, expect, it } from "vitest"

import { hydrateRecruitingDraft } from "./recruitingDraftHydration"

import type {
  RecruitingAdminFormStructure,
  RecruitingRound,
  RecruitingRoundGroup,
} from "../api/types"

const GROUP: RecruitingRoundGroup = {
  seasonId: "10",
  gisuId: "15",
  chapterId: "27",
  chapterName: "Neon",
  schoolId: "3",
  schoolName: "가천대학교",
  rounds: [],
}

const ROUND: RecruitingRound = {
  roundId: "20",
  title: "가천대 UMC 10기 정규 모집 문의",
  type: "REGULAR",
  roundNo: 1,
  recruitableTracks: ["PLAN"],
  secondChoiceEnabled: false,
  documentStartAt: "2026-08-10T01:00:00.000Z",
  documentEndAt: "2026-08-20T14:59:00.000Z",
  documentResultPublishedAt: "2026-08-22T09:00:00.000Z",
  interviewRequired: false,
  interviewStartAt: null,
  interviewEndAt: null,
  finalResultPublishedAt: "2026-08-25T09:00:00.000Z",
  announcement: "지원 안내",
  contactText: "문의 연락처",
  status: "DRAFT",
}

const FORM: RecruitingAdminFormStructure = {
  exists: true,
  applicationFormId: "50",
  formId: "100",
  title: "지원서",
  description: null,
  status: "DRAFT",
  sections: [
    {
      sectionId: "1",
      clientKey: "section-1",
      title: "기본 문항",
      description: null,
      orderNo: 1,
      type: "COMMON",
      track: null,
      questions: [
        {
          questionId: "11",
          title: "신규 지원자이신가요?",
          description: null,
          type: "RADIO",
          required: true,
          orderNo: 1,
          options: [],
        },
        {
          questionId: "12",
          title: "지원자님의 성함을 알려주세요.",
          description: null,
          type: "SHORT_TEXT",
          required: true,
          orderNo: 2,
          options: [],
        },
        {
          questionId: "13",
          title: "1지망 지원 파트를 알려주세요.",
          description: null,
          type: "RADIO",
          required: true,
          orderNo: 3,
          options: [
            {
              optionId: "1",
              content: "PM",
              orderNo: 1,
              other: false,
              nextSectionId: null,
              nextSectionKey: "section-3",
            },
          ],
        },
        {
          questionId: "15",
          title: "이메일 주소를 입력해 주세요.",
          description: null,
          type: "SHORT_TEXT",
          required: true,
          orderNo: 5,
          options: [],
        },
      ],
    },
    {
      sectionId: "3",
      clientKey: "section-3",
      title: "PM",
      description: null,
      orderNo: 3,
      type: "TRACK",
      track: "PLAN",
      questions: [
        {
          questionId: "30",
          title: "지원 동기",
          description: null,
          type: "LONG_TEXT",
          required: true,
          orderNo: 1,
          options: [],
        },
      ],
    },
    {
      sectionId: "4",
      clientKey: "section-4",
      title: "공통 문항",
      description: null,
      orderNo: 4,
      type: "COMMON",
      track: null,
      questions: [
        {
          questionId: "40",
          title: "UMC에 지원한 이유를 알려주세요.",
          description: "지원 동기를 작성해 주세요.",
          type: "LONG_TEXT",
          required: true,
          orderNo: 1,
          options: [],
        },
      ],
    },
  ],
}

describe("hydrateRecruitingDraft", () => {
  it("서버 DRAFT의 기본 정보와 공고 내용을 모집 생성 상태로 복원한다", () => {
    const result = hydrateRecruitingDraft(GROUP, ROUND, FORM, 10)

    expect(result.roundId).toBe("20")
    expect(result.basicInfo).toMatchObject({
      chapter: "Neon",
      school: "가천대",
      recruitmentType: "REGULAR",
      roundNo: "1",
      footer: "문의",
    })
    expect(result.announcement).toBe("지원 안내")
    expect(result.contactText).toBe("문의 연락처")
  })

  it("기본 문항 토글·사용 파트를 복원한다", () => {
    const result = hydrateRecruitingDraft(GROUP, ROUND, FORM, 10)

    expect(result.questionState.questionToggleState["03"]).toMatchObject({
      enabled: true,
      required: true,
      questionId: 13,
    })
    expect(result.questionState.questionToggleState["04"]).toMatchObject({
      enabled: false,
      required: true,
    })
    expect(result.questionState.removedOptionsByQuestionIndex["03"]).toEqual([
      "Design",
      "Web PE",
      "Mobile PE",
    ])
    expect(result.questionState.basicSectionId).toBe(1)
    expect(result.questionState.commonSectionId).toBe(4)
    expect(result.questionState.commonQuestionDrafts).toHaveLength(1)
    expect(result.questionState.commonQuestionDrafts[0]).toMatchObject({
      id: "40",
      questionId: 40,
      title: "UMC에 지원한 이유를 알려주세요.",
      caption: "지원 동기를 작성해 주세요.",
      fieldType: "text",
      required: true,
    })
    expect(result.questionState.partSectionIds.pm).toBe(3)
    expect(result.questionState.enabledParts).toEqual({
      pm: true,
      design: false,
      webPe: false,
      mobilePe: false,
    })
    expect(result.questionState.partQuestionDrafts.pm[0]?.questionId).toBe(30)
    expect(
      result.questionState.questionToggleState["03"]?.optionIdsByContent,
    ).toEqual({ PM: 1 })
    expect(
      result.questionState.questionToggleState["03"]?.nextSectionKeysByContent,
    ).toEqual({ PM: "track-PLAN" })
  })
})
