import { describe, expect, it } from "vitest"

import { countSchools, groupByChapter } from "./applicationStats"

import type {
  RecruitingSchoolStatusSummary,
  RecruitingStatusSummary,
} from "../api/types"

function school(
  override: Partial<RecruitingSchoolStatusSummary> = {},
): RecruitingSchoolStatusSummary {
  return {
    schoolId: "1",
    schoolName: "가천대",
    chapterId: "27",
    chapterName: "Neon",
    totalCount: 10,
    countByStatus: {},
    parts: [],
    rounds: [],
    ...override,
  }
}

function summary(
  schools: RecruitingSchoolStatusSummary[],
): RecruitingStatusSummary {
  return {
    totalCount: schools.reduce((sum, item) => sum + item.totalCount, 0),
    countByStatus: {},
    parts: [],
    schools,
  }
}

describe("groupByChapter", () => {
  it("학교가 없으면 빈 배열을 반환한다", () => {
    expect(groupByChapter(summary([]))).toEqual([])
  })

  it("같은 지부의 학교를 묶고 totalCount 를 합산한다", () => {
    const groups = groupByChapter(
      summary([
        school({ schoolId: "1", schoolName: "가천대", totalCount: 10 }),
        school({ schoolId: "2", schoolName: "인하대", totalCount: 5 }),
      ]),
    )

    expect(groups).toHaveLength(1)
    expect(groups[0]?.chapterId).toBe("27")
    expect(groups[0]?.totalCount).toBe(15)
    expect(groups[0]?.schools.map((item) => item.schoolName)).toEqual([
      "가천대",
      "인하대",
    ])
  })

  // 서버에 이름이 같은 지부가 실제로 존재한다(dev 의 Pegasus id 7/23).
  it("지부명이 같아도 chapterId 가 다르면 별도 지부로 나눈다", () => {
    const groups = groupByChapter(
      summary([
        school({
          schoolId: "1",
          chapterId: "7",
          chapterName: "Pegasus",
          totalCount: 3,
        }),
        school({
          schoolId: "2",
          chapterId: "23",
          chapterName: "Pegasus",
          totalCount: 4,
        }),
      ]),
    )

    expect(groups).toHaveLength(2)
    expect(groups.map((group) => group.chapterId).sort()).toEqual(["23", "7"])
    expect(groups.every((group) => group.totalCount > 0)).toBe(true)
  })

  it("CHAPTERS 상수에 없는 지부도 버리지 않는다", () => {
    const groups = groupByChapter(
      summary([
        school({ chapterId: "1", chapterName: "GOAT" }),
        school({ schoolId: "2", chapterId: "27", chapterName: "Neon" }),
      ]),
    )

    expect(groups.map((group) => group.chapterName)).toEqual(["GOAT", "Neon"])
  })

  it("지부는 지부명, 학교는 학교명 가나다순으로 정렬한다", () => {
    const groups = groupByChapter(
      summary([
        school({ schoolId: "1", schoolName: "인하대", chapterId: "27" }),
        school({ schoolId: "2", schoolName: "가천대", chapterId: "27" }),
        school({
          schoolId: "3",
          schoolName: "동국대",
          chapterId: "30",
          chapterName: "Ferrum",
        }),
      ]),
    )

    expect(groups.map((group) => group.chapterName)).toEqual(["Ferrum", "Neon"])
    expect(groups[1]?.schools.map((item) => item.schoolName)).toEqual([
      "가천대",
      "인하대",
    ])
  })
})

describe("countSchools", () => {
  it("학교 수를 센다", () => {
    expect(
      countSchools(
        summary([school({ schoolId: "1" }), school({ schoolId: "2" })]),
      ),
    ).toBe(2)
  })

  it("같은 schoolId 가 여러 번 오면 한 번만 센다", () => {
    expect(
      countSchools(
        summary([
          school({ schoolId: "1", chapterId: "27" }),
          school({ schoolId: "1", chapterId: "30" }),
        ]),
      ),
    ).toBe(1)
  })
})
