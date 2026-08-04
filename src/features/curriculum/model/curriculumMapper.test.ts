import { describe, expect, it } from "vitest"

import {
  mapOverviewToCurriculumItem,
  mapWeeklyOverviewToWorkbook,
} from "./curriculumMapper"

describe("curriculumMapper", () => {
  it("mapWeeklyOverviewToWorkbook - missions 데이터가 있으면 전달받은 데이터를 보존한다", () => {
    const mockWeek = {
      weeklyCurriculumId: 10,
      weekNo: 1,
      title: "1주차",
      missions: ["미션 1", "미션 2"],
    }

    const result = mapWeeklyOverviewToWorkbook(mockWeek, 0)
    expect(result.missions).toEqual(["미션 1", "미션 2"])
  })

  it("mapOverviewToCurriculumItem - missionCount를 workbooks의 missions 개수 기반으로 계산한다", () => {
    const mockOverview = {
      curriculumId: 1,
      title: "스프링 기초",
      weeks: [
        {
          weeklyCurriculumId: 10,
          weekNo: 1,
          title: "1주차",
          missions: ["미션 A", "미션 B"],
        },
        {
          weeklyCurriculumId: 20,
          weekNo: 2,
          title: "2주차",
          missions: ["미션 C"],
        },
      ],
    }

    const result = mapOverviewToCurriculumItem(mockOverview, 0)
    expect(result.missionCount).toBe(3)
    expect(result.workbooks[0]?.missions).toEqual(["미션 A", "미션 B"])
    expect(result.workbooks[1]?.missions).toEqual(["미션 C"])
  })
})
