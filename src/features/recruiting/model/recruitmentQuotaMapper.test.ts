import { describe, expect, it } from "vitest"

import { mapGroupsToChapterQuotaData } from "./recruitmentQuotaMapper"

import type {
  RecruitingRoundGroup,
  RecruitingSeasonConfigurationResponse,
} from "../api/types"

describe("mapGroupsToChapterQuotaData", () => {
  const groups: RecruitingRoundGroup[] = [
    {
      seasonId: "100",
      gisuId: "15",
      chapterId: "1",
      chapterName: "Chromium",
      schoolId: "10",
      schoolName: "서울대학교",
      rounds: [],
    },
    {
      seasonId: "200",
      gisuId: "15",
      chapterId: "1",
      chapterName: "Chromium",
      schoolId: "20",
      schoolName: "연세대학교",
      rounds: [],
    },
  ]

  const seasonConfigsMap = new Map<
    string,
    RecruitingSeasonConfigurationResponse
  >([
    [
      "100",
      {
        id: "100",
        gisuId: "15",
        schoolId: "10",
        memo: null,
        quotas: [
          { track: "PLAN", targetCount: 2 },
          { track: "DESIGN", targetCount: 3 },
          { track: "WEB_PRODUCT_ENGINEER", targetCount: 5 },
          { track: "MOBILE_PRODUCT_ENGINEER", targetCount: 4 },
        ],
        rounds: [],
      },
    ],
    [
      "200",
      {
        id: "200",
        gisuId: "15",
        schoolId: "20",
        memo: null,
        quotas: [
          { track: "PLAN", targetCount: 1 },
          { track: "DESIGN", targetCount: 1 },
          { track: "WEB_PRODUCT_ENGINEER", targetCount: 2 },
          { track: "MOBILE_PRODUCT_ENGINEER", targetCount: 2 },
        ],
        rounds: [],
      },
    ],
  ])

  it("그룹과 시즌 설정을 바탕으로 ChapterQuotaData 배열을 생성한다", () => {
    const fixedNow = new Date("2026-08-02T09:00:00Z")
    const result = mapGroupsToChapterQuotaData(
      groups,
      seasonConfigsMap,
      fixedNow,
    )

    const chromium = result.find((item) => item.chapter === "Chromium")
    expect(chromium).toBeDefined()
    expect(chromium?.schoolCount).toBe(2)
    expect(chromium?.schools).toHaveLength(2)

    expect(chromium?.schools[0]).toEqual({
      seasonId: "100",
      gisuId: "15",
      schoolId: "10",
      schoolName: "서울대학교",
      pm: 2,
      design: 3,
      webPe: 5,
      mobilePe: 4,
      total: 14,
    })

    expect(chromium?.totals).toEqual({
      pm: 3,
      design: 4,
      webPe: 7,
      mobilePe: 6,
      total: 20,
    })
  })

  it("시즌 설정이 없으면 0명으로 처리한다", () => {
    const fixedNow = new Date("2026-08-02T09:00:00Z")
    const result = mapGroupsToChapterQuotaData(groups, new Map(), fixedNow)

    const chromium = result.find((item) => item.chapter === "Chromium")
    expect(chromium?.schools[0]?.total).toBe(0)
    expect(chromium?.totals.total).toBe(0)
  })

  it("now 인자가 없으면 updatedDate와 updatedTime을 undefined로 설정한다", () => {
    const result = mapGroupsToChapterQuotaData(groups, seasonConfigsMap)
    const chromium = result.find((item) => item.chapter === "Chromium")
    expect(chromium?.updatedDate).toBeUndefined()
    expect(chromium?.updatedTime).toBeUndefined()
  })
})
