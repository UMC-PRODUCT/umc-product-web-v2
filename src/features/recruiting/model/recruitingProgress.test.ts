import { describe, expect, it } from "vitest"

import { hasOpenAdditionalRound, hasOpenRound } from "./recruitingProgress"

import type {
  RecruitingRound,
  RecruitingRoundGroup,
  RecruitingRoundType,
} from "../api/types"

function round(type: RecruitingRoundType): RecruitingRound {
  return {
    roundId: "1",
    title: "차수",
    type,
    roundNo: 1,
    recruitableTracks: [],
    secondChoiceEnabled: false,
    documentStartAt: null,
    documentEndAt: null,
    documentResultPublishedAt: null,
    interviewRequired: false,
    interviewStartAt: null,
    interviewEndAt: null,
    finalResultPublishedAt: null,
    announcement: null,
    applicationFormId: null,
    formId: null,
    applicationOpen: true,
  }
}

function group(rounds: RecruitingRound[]): RecruitingRoundGroup {
  return {
    seasonId: "100",
    gisuId: "5",
    chapterId: "29",
    chapterName: "Chromium",
    schoolId: "6",
    schoolName: "광운대학교",
    rounds,
  }
}

describe("hasOpenRound", () => {
  it("열린 차수가 하나라도 있으면 true", () => {
    expect(hasOpenRound([group([round("REGULAR")])])).toBe(true)
  })

  it("추가모집만 열려 있어도 true", () => {
    expect(hasOpenRound([group([round("ADDITIONAL")])])).toBe(true)
  })

  it("그룹이 비면 false", () => {
    expect(hasOpenRound([])).toBe(false)
  })

  // 시즌은 있는데 열린 차수가 없는 경우
  it("차수가 없는 그룹만 있으면 false", () => {
    expect(hasOpenRound([group([])])).toBe(false)
  })
})

describe("hasOpenAdditionalRound", () => {
  it("열린 추가모집이 있으면 true", () => {
    expect(hasOpenAdditionalRound([group([round("ADDITIONAL")])])).toBe(true)
  })

  // 평가 중 신규 지원자 유입을 알리는 판정이라 본모집은 세지 않는다.
  it("본모집만 열려 있으면 false", () => {
    expect(hasOpenAdditionalRound([group([round("REGULAR")])])).toBe(false)
  })

  it("본모집과 추가모집이 섞여 있으면 true", () => {
    expect(
      hasOpenAdditionalRound([group([round("REGULAR"), round("ADDITIONAL")])]),
    ).toBe(true)
  })

  it("다른 학교 그룹의 추가모집도 잡는다", () => {
    expect(
      hasOpenAdditionalRound([
        group([round("REGULAR")]),
        group([round("ADDITIONAL")]),
      ]),
    ).toBe(true)
  })

  it("그룹이 비면 false", () => {
    expect(hasOpenAdditionalRound([])).toBe(false)
  })
})
