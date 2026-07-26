import { describe, expect, it } from "vitest"

import { mergeRoundGroups } from "./recruitingApi"

import type { RecruitingRound, RecruitingRoundGroup } from "./types"

function round(roundId: string): RecruitingRound {
  return {
    roundId,
    title: `차수 ${roundId}`,
    type: "REGULAR",
    roundNo: 1,
    recruitableTracks: [],
    secondChoiceEnabled: false,
    documentStartAt: null,
    documentEndAt: null,
    documentResultPublishedAt: null,
    interviewRequired: true,
    interviewStartAt: null,
    interviewEndAt: null,
    finalResultPublishedAt: null,
    announcement: null,
    applicationFormId: "9",
    formId: "9",
    applicationOpen: false,
  }
}

function group(
  seasonId: string,
  rounds: RecruitingRound[],
): RecruitingRoundGroup {
  return {
    seasonId,
    gisuId: "5",
    chapterId: "1",
    chapterName: "서울",
    schoolId: "2",
    schoolName: "중앙대학교",
    rounds,
  }
}

describe("mergeRoundGroups", () => {
  it("같은 시즌의 차수를 한 그룹으로 합친다", () => {
    const merged = mergeRoundGroups([
      group("100", [round("1")]),
      group("100", [round("2")]),
    ])

    expect(merged).toHaveLength(1)
    expect(merged[0]?.rounds.map((item) => item.roundId)).toEqual(["1", "2"])
  })

  it("두 구간에 겹쳐 나온 차수를 중복으로 남기지 않는다", () => {
    const merged = mergeRoundGroups([
      group("100", [round("1"), round("2")]),
      group("100", [round("2"), round("3")]),
    ])

    expect(merged[0]?.rounds.map((item) => item.roundId)).toEqual([
      "1",
      "2",
      "3",
    ])
  })

  it("시즌이 다르면 그룹을 나눠 둔다", () => {
    const merged = mergeRoundGroups([
      group("100", [round("1")]),
      group("200", [round("2")]),
    ])

    expect(merged.map((item) => item.seasonId)).toEqual(["100", "200"])
  })

  it("빈 입력은 빈 결과가 된다", () => {
    expect(mergeRoundGroups([])).toEqual([])
  })
})
