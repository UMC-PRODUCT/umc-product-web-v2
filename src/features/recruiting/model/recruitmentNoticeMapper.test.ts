import { describe, expect, it } from "vitest"

import { toRecruitmentNoticeItems } from "./recruitmentNoticeMapper"

import type {
  RecruitingRound,
  RecruitingRoundGroup,
  RecruitingTrack,
} from "../api/types"

const NOW = new Date("2026-07-27T09:00:00+09:00")

function round(partial: Partial<RecruitingRound> = {}): RecruitingRound {
  return {
    roundId: "7",
    title: "한양대학교 ERICA UMC 11기 정규 모집",
    type: "REGULAR",
    roundNo: 1,
    recruitableTracks: ["PLAN", "DESIGN"] as RecruitingTrack[],
    secondChoiceEnabled: true,
    documentStartAt: "2026-07-24T00:00:00+09:00",
    documentEndAt: "2026-08-06T23:59:00+09:00",
    documentResultPublishedAt: null,
    interviewRequired: false,
    interviewStartAt: null,
    interviewEndAt: null,
    finalResultPublishedAt: null,
    announcement: "모집 공지",
    applicationFormId: "31",
    formId: "44",
    applicationOpen: true,
    ...partial,
  }
}

function group(rounds: RecruitingRound[]): RecruitingRoundGroup {
  return {
    seasonId: "5",
    gisuId: "11",
    chapterId: "1",
    chapterName: "서울",
    schoolId: "3",
    schoolName: "한양대학교 ERICA",
    rounds,
  } as RecruitingRoundGroup
}

describe("toRecruitmentNoticeItems", () => {
  it("차수를 공고 카드로 옮긴다", () => {
    const [item] = toRecruitmentNoticeItems([group([round()])], NOW)
    expect(item).toMatchObject({
      id: "7",
      title: "한양대학교 ERICA UMC 11기 정규 모집",
      schoolName: "한양대학교 ERICA",
      parts: ["pm", "design"],
      isClosed: false,
      announcement: "모집 공지",
    })
  })

  it("모집 파트에 없는 트랙은 태그로 만들지 않는다", () => {
    const [item] = toRecruitmentNoticeItems(
      [group([round({ recruitableTracks: ["INFRA_PLUS", "PLAN"] })])],
      NOW,
    )
    expect(item?.parts).toEqual(["pm"])
  })

  it("남은 일수를 날짜 경계로 센다", () => {
    const [item] = toRecruitmentNoticeItems([group([round()])], NOW)
    expect(item?.dDay).toBe(10)
  })

  it("마감 당일은 0 일로 센다", () => {
    const [item] = toRecruitmentNoticeItems(
      [group([round({ documentEndAt: "2026-07-27T23:59:00+09:00" })])],
      NOW,
    )
    expect(item?.dDay).toBe(0)
  })

  it("마감된 공고는 남은 일수를 세지 않는다", () => {
    const [item] = toRecruitmentNoticeItems(
      [group([round({ applicationOpen: false })])],
      NOW,
    )
    expect(item?.isClosed).toBe(true)
    expect(item?.dDay).toBeUndefined()
  })

  it("지원 기간이 없는 차수는 공고로 만들지 않는다", () => {
    expect(
      toRecruitmentNoticeItems(
        [group([round({ documentStartAt: null, documentEndAt: null })])],
        NOW,
      ),
    ).toEqual([])
  })

  it("공지가 없으면 빈 문자열로 둔다", () => {
    const [item] = toRecruitmentNoticeItems(
      [group([round({ announcement: null })])],
      NOW,
    )
    expect(item?.announcement).toBe("")
  })

  it("진행 중을 먼저, 그 안에서는 마감 임박한 순으로 놓는다", () => {
    const items = toRecruitmentNoticeItems(
      [
        group([
          round({ roundId: "1", applicationOpen: false }),
          round({ roundId: "2", documentEndAt: "2026-08-20T23:59:00+09:00" }),
          round({ roundId: "3", documentEndAt: "2026-08-01T23:59:00+09:00" }),
        ]),
      ],
      NOW,
    )
    expect(items.map((item) => item.id)).toEqual(["3", "2", "1"])
  })

  it("여러 학교의 차수를 한 목록으로 합친다", () => {
    const other = {
      ...group([round({ roundId: "9" })]),
      schoolName: "중앙대학교",
    }
    const items = toRecruitmentNoticeItems([group([round()]), other], NOW)
    expect(items.map((item) => item.schoolName)).toEqual([
      "한양대학교 ERICA",
      "중앙대학교",
    ])
  })
})
