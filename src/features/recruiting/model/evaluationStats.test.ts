import { describe, expect, it } from "vitest"

import {
  toApplicantCountsByPart,
  toChapterCompletions,
  toChapterEvaluationBars,
  toCompletionPercentage,
  toEvaluatedCountsByPart,
  toSchoolEvaluationBars,
} from "./evaluationStats"

import type {
  RecruitingEvaluationStatistics,
  RecruitingTrackCount,
} from "../api/types"

// 서버는 INFRA_PLUS 를 뺀 4개 트랙을 0건이어도 항상 반환한다.
const BY_TRACK: RecruitingTrackCount[] = [
  { track: "PLAN", applicantCount: 10, evaluatedCount: 4 },
  { track: "DESIGN", applicantCount: 8, evaluatedCount: 8 },
  { track: "WEB_PRODUCT_ENGINEER", applicantCount: 6, evaluatedCount: 0 },
  { track: "MOBILE_PRODUCT_ENGINEER", applicantCount: 0, evaluatedCount: 0 },
]

function statistics(): RecruitingEvaluationStatistics {
  return {
    asOf: "2026-07-30T10:22:48Z",
    applicantCount: 24,
    evaluatedCount: 12,
    byTrack: BY_TRACK,
    chapters: [
      {
        chapterId: "29",
        chapterName: "Chromium",
        applicantCount: 20,
        evaluatedCount: 10,
        byTrack: BY_TRACK,
        schools: [
          {
            schoolId: "6",
            schoolName: "광운대학교",
            applicantCount: 12,
            evaluatedCount: 6,
            byTrack: BY_TRACK,
          },
        ],
      },
      {
        chapterId: "30",
        chapterName: "Ferrum",
        applicantCount: 4,
        evaluatedCount: 2,
        byTrack: [],
        schools: [],
      },
    ],
  }
}

describe("트랙 -> 파트 변환", () => {
  it("서버 트랙명을 대시보드 PartKey 로 옮긴다", () => {
    expect(toApplicantCountsByPart(BY_TRACK)).toEqual({
      pm: 10,
      design: 8,
      webPe: 6,
      mobilePe: 0,
    })
    expect(toEvaluatedCountsByPart(BY_TRACK)).toEqual({
      pm: 4,
      design: 8,
      webPe: 0,
      mobilePe: 0,
    })
  })

  // INFRA_PLUS 는 리크루팅 파트 표기가 없다. 넣으면 어느 파트에도 안 더해져야 한다.
  it("INFRA_PLUS 는 어느 파트에도 더하지 않는다", () => {
    const counts = toApplicantCountsByPart([
      ...BY_TRACK,
      { track: "INFRA_PLUS", applicantCount: 99, evaluatedCount: 99 },
    ])

    expect(counts).toEqual({ pm: 10, design: 8, webPe: 6, mobilePe: 0 })
  })

  it("byTrack 이 비면 전 파트가 0 이다", () => {
    expect(toEvaluatedCountsByPart([])).toEqual({
      pm: 0,
      design: 0,
      webPe: 0,
      mobilePe: 0,
    })
  })
})

describe("toCompletionPercentage", () => {
  it("평가 완료 비율을 정수로 반올림한다", () => {
    expect(toCompletionPercentage(1, 3)).toBe(33)
    expect(toCompletionPercentage(2, 3)).toBe(67)
    expect(toCompletionPercentage(12, 24)).toBe(50)
  })

  // 지원자 0 명인 학교도 응답에 포함되므로 0 나누기가 실제로 발생한다.
  it("분모가 0 이면 0 을 반환한다", () => {
    expect(toCompletionPercentage(0, 0)).toBe(0)
  })

  it("전원 평가 완료면 100 이다", () => {
    expect(toCompletionPercentage(8, 8)).toBe(100)
  })
})

describe("toChapterCompletions", () => {
  it("지부별 완료 수와 비율을 만든다", () => {
    expect(toChapterCompletions(statistics())).toEqual([
      { chapterId: "29", chapterName: "Chromium", count: 10, percentage: 50 },
      { chapterId: "30", chapterName: "Ferrum", count: 2, percentage: 50 },
    ])
  })
})

describe("toChapterEvaluationBars", () => {
  it("평가 완료를 앞 막대, 지원자 수를 뒤 막대로 넣는다", () => {
    const bars = toChapterEvaluationBars(statistics())

    expect(bars[0]?.count).toBe(10)
    expect(bars[0]?.compareCount).toBe(20)
  })

  it("툴팁 breakdown 에 파트별 지원/평가를 함께 담는다", () => {
    const bars = toChapterEvaluationBars(statistics())

    expect(bars[0]?.breakdown.pm).toEqual({ applied: 10, evaluated: 4 })
    expect(bars[0]?.breakdown.mobilePe).toEqual({ applied: 0, evaluated: 0 })
  })
})

describe("toSchoolEvaluationBars", () => {
  // 서버가 지부 가나다 > 학교 가나다로 정렬해 주므로 순서를 바꾸지 않는다.
  it("지부를 넘어 학교를 서버 순서대로 편다", () => {
    const schools = toSchoolEvaluationBars(statistics())

    expect(schools).toHaveLength(1)
    expect(schools[0]?.name).toBe("광운대학교")
    expect(schools[0]?.chapterId).toBe("29")
    expect(schools[0]?.counts.pm).toBe(4)
    expect(schools[0]?.applicants.pm).toBe(10)
  })

  it("학교가 없는 지부는 건너뛴다", () => {
    const schools = toSchoolEvaluationBars(statistics())

    expect(schools.every((school) => school.chapterId !== "30")).toBe(true)
  })
})
