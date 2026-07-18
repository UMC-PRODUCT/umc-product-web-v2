import { describe, expect, it } from "vitest"

import {
  type ApplicantRow,
  DEFAULT_APPLICANT_LIST_FILTERS,
} from "./applicantListTypes"
import {
  groupRowsByChapter,
  groupRowsBySchool,
  resolveApplicantListViewKind,
  resolveScopeChapters,
} from "./applicantListView"

import type { Chapter } from "@/entities/organization/model/chapters"

function createApplicant(
  applicationId: string,
  chapter: Chapter,
  school: string,
): ApplicantRow {
  return {
    applicationId,
    appliedAt: "2026-04-22T09:00:00",
    interviewAt: null,
    applicantName: applicationId,
    chapter,
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

describe("resolveApplicantListViewKind", () => {
  it("지부 탭을 선택하면 학교 그룹 뷰를 반환한다", () => {
    expect(
      resolveApplicantListViewKind({
        ...DEFAULT_APPLICANT_LIST_FILTERS,
        chapterTab: "Ferrum",
      }),
    ).toBe("schoolGroups")
  })

  it("학교별 보기를 켜면 학교 그룹 뷰를 반환한다", () => {
    expect(
      resolveApplicantListViewKind({
        ...DEFAULT_APPLICANT_LIST_FILTERS,
        bySchool: true,
      }),
    ).toBe("schoolGroups")
  })

  it("지부 드롭다운을 선택하면 지부 그룹 뷰를 반환한다", () => {
    expect(
      resolveApplicantListViewKind({
        ...DEFAULT_APPLICANT_LIST_FILTERS,
        chapters: ["Chromium", "Neon"],
      }),
    ).toBe("chapterGroups")
  })

  it("선택이 없으면 단일 카드 뷰를 반환한다", () => {
    expect(resolveApplicantListViewKind(DEFAULT_APPLICANT_LIST_FILTERS)).toBe(
      "single",
    )
  })
})

describe("resolveScopeChapters", () => {
  it("지부 탭 선택 시 해당 지부만 반환한다", () => {
    expect(
      resolveScopeChapters({
        ...DEFAULT_APPLICANT_LIST_FILTERS,
        chapterTab: "Neon",
      }),
    ).toEqual(["Neon"])
  })

  it("지부 드롭다운 선택을 CHAPTERS 순서로 정규화한다", () => {
    expect(
      resolveScopeChapters({
        ...DEFAULT_APPLICANT_LIST_FILTERS,
        chapters: ["Neon", "Chromium"],
      }),
    ).toEqual(["Chromium", "Neon"])
  })
})

describe("그룹핑", () => {
  const rows = [
    createApplicant("a", "Ferrum", "이화여대"),
    createApplicant("b", "Chromium", "광운대"),
    createApplicant("c", "Ferrum", "동국대"),
  ]

  it("지원자가 있는 지부만 지부 순서대로 그룹핑한다", () => {
    const groups = groupRowsByChapter(rows, ["Chromium", "Ferrum", "Neon"])

    expect(groups.map(({ chapter }) => chapter)).toEqual(["Chromium", "Ferrum"])
  })

  it("지부 내 학교를 학교 목록 순서로 그룹핑한다", () => {
    const groups = groupRowsBySchool(rows, ["Ferrum"])

    expect(groups).toHaveLength(1)
    expect(groups[0]?.schools.map(({ school }) => school)).toEqual([
      "동국대",
      "이화여대",
    ])
  })

  it("학교 목록에 없는 학교의 지원자도 그룹에 포함한다", () => {
    const groups = groupRowsBySchool(
      [...rows, createApplicant("d", "Ferrum", "신규대")],
      ["Ferrum"],
    )

    expect(groups[0]?.schools.map(({ school }) => school)).toEqual([
      "동국대",
      "이화여대",
      "신규대",
    ])
  })
})
