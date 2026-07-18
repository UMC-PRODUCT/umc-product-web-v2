import { describe, expect, it } from "vitest"

import {
  type ApplicantRow,
  applyCardFilters,
  DEFAULT_APPLICANT_CARD_FILTERS,
  formatAppliedAtParts,
} from "./applicantListTypes"

function createApplicant(
  applicationId: string,
  appliedAt: string,
  school: string,
): ApplicantRow {
  return {
    applicationId,
    appliedAt,
    interviewAt: null,
    applicantName: applicationId,
    chapter: "Chromium",
    school,
    recruitmentType: "regular",
    parts: ["web-pe"],
    evaluations: {
      document: {
        progress: "before",
        doneCount: 0,
        totalCount: 1,
        result: null,
        myProgress: "before",
      },
      interview: null,
      final: null,
    },
  }
}

describe("applyCardFilters 정렬", () => {
  it("등록 순을 학교순보다 우선 적용한다", () => {
    const older = createApplicant("older", "2026-04-21T09:00:00", "한성대")
    const newer = createApplicant("newer", "2026-04-22T09:00:00", "가천대")

    const result = applyCardFilters(
      [newer, older],
      {
        ...DEFAULT_APPLICANT_CARD_FILTERS,
        sort: "registered",
        order: "school",
      },
      "document",
    )

    expect(result.map(({ applicationId }) => applicationId)).toEqual([
      "older",
      "newer",
    ])
  })

  it("지원 일시가 같으면 학교순을 보조 기준으로 적용한다", () => {
    const second = createApplicant("second", "2026-04-22T09:00:00", "한성대")
    const first = createApplicant("first", "2026-04-22T09:00:00", "가천대")

    const result = applyCardFilters(
      [second, first],
      {
        ...DEFAULT_APPLICANT_CARD_FILTERS,
        order: "school",
      },
      "document",
    )

    expect(result.map(({ applicationId }) => applicationId)).toEqual([
      "first",
      "second",
    ])
  })
})

describe("formatAppliedAtParts", () => {
  it("지원 일시를 날짜와 시간으로 분리한다", () => {
    expect(formatAppliedAtParts("2026-04-22T03:33:00")).toEqual({
      date: "04/22",
      time: "03:33",
    })
  })
})
