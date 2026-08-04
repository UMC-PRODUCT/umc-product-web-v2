import { describe, expect, it } from "vitest"

import {
  applyScopeFilters,
  resolveRecruitingScope,
  resolveScopeTabs,
} from "./recruitingScope"

import type { RecruitingRoundGroup } from "../api/types"

function group(
  seasonId: string,
  chapterName: string,
  schoolName: string,
): RecruitingRoundGroup {
  return {
    seasonId,
    gisuId: "5",
    chapterId: "1",
    chapterName,
    schoolId: seasonId,
    schoolName,
    rounds: [],
  }
}

const GROUPS = [
  group("1", "서울", "중앙대학교"),
  group("2", "서울", "한양대학교"),
  group("3", "경기", "아주대학교"),
]

describe("resolveRecruitingScope", () => {
  it("관리 권한이 있는 시즌만 범위에 넣는다", () => {
    const scope = resolveRecruitingScope(
      GROUPS,
      new Set(["1", "3"]),
      "중앙대학교",
    )

    expect(scope.groups.map((g) => g.seasonId)).toEqual(["1", "3"])
    expect(scope.chapters).toEqual(["서울", "경기"])
    expect(scope.isFallback).toBe(false)
  })

  it("권한이 하나도 없으면 내 학교로 좁힌다", () => {
    const scope = resolveRecruitingScope(GROUPS, new Set(), "한양대학교")

    expect(scope.groups.map((g) => g.seasonId)).toEqual(["2"])
    expect(scope.isFallback).toBe(true)
  })

  it("권한도 없고 내 학교 모집도 없으면 비어 있다", () => {
    const scope = resolveRecruitingScope(GROUPS, new Set(), "고려대학교")
    expect(scope.groups).toEqual([])
    expect(scope.isFallback).toBe(false)
  })

  it("학교 정보를 모르면 폴백하지 않는다", () => {
    const scope = resolveRecruitingScope(GROUPS, new Set(), undefined)
    expect(scope.groups).toEqual([])
  })

  it("권한이 있으면 내 학교가 아니어도 폴백으로 덮지 않는다", () => {
    const scope = resolveRecruitingScope(GROUPS, new Set(["3"]), "중앙대학교")

    expect(scope.groups.map((g) => g.schoolName)).toEqual(["아주대학교"])
    expect(scope.isFallback).toBe(false)
  })

  it("시즌 id 가 숫자로 와도 매칭된다", () => {
    const numeric = [
      { ...group("1", "서울", "중앙대학교"), seasonId: 1 as unknown as string },
    ]
    const scope = resolveRecruitingScope(numeric, new Set(["1"]), undefined)
    expect(scope.groups).toHaveLength(1)
  })
})

describe("resolveScopeTabs", () => {
  it("지부가 여럿이면 지부 탭을 쓴다", () => {
    const scope = resolveRecruitingScope(GROUPS, new Set(["1", "3"]), undefined)
    expect(resolveScopeTabs(scope)).toEqual({
      showChapterTabs: true,
      showSchoolTabs: false,
    })
  })

  it("한 지부에 학교가 여럿이면 학교 탭을 쓴다", () => {
    const scope = resolveRecruitingScope(GROUPS, new Set(["1", "2"]), undefined)
    expect(resolveScopeTabs(scope)).toEqual({
      showChapterTabs: false,
      showSchoolTabs: true,
    })
  })

  it("학교 하나면 탭을 두지 않는다", () => {
    const scope = resolveRecruitingScope(GROUPS, new Set(["1"]), undefined)
    expect(resolveScopeTabs(scope)).toEqual({
      showChapterTabs: false,
      showSchoolTabs: false,
    })
  })
})

describe("applyScopeFilters", () => {
  const wide = resolveRecruitingScope(
    GROUPS,
    new Set(["1", "2", "3"]),
    undefined,
  )

  it("지부 탭을 고르면 그 지부만 남긴다", () => {
    expect(
      applyScopeFilters(wide, "서울", "all", []).map((g) => g.schoolName),
    ).toEqual(["중앙대학교", "한양대학교"])
  })

  it("전체 탭에서 지부를 고르지 않으면 아무것도 조회하지 않는다", () => {
    expect(applyScopeFilters(wide, "all", "all", [])).toEqual([])
  })

  it("전체 탭에서 고른 지부만 조회한다", () => {
    expect(
      applyScopeFilters(wide, "all", "all", ["경기"]).map((g) => g.schoolName),
    ).toEqual(["아주대학교"])
  })

  it("한 지부 안에서는 학교 탭으로 좁힌다", () => {
    const chapterScope = resolveRecruitingScope(
      GROUPS,
      new Set(["1", "2"]),
      undefined,
    )
    expect(
      applyScopeFilters(chapterScope, "all", "한양대학교", []).map(
        (g) => g.schoolName,
      ),
    ).toEqual(["한양대학교"])
  })

  it("탭이 없으면 범위를 그대로 쓴다", () => {
    const single = resolveRecruitingScope(GROUPS, new Set(["1"]), undefined)
    expect(applyScopeFilters(single, "all", "all", [])).toHaveLength(1)
  })
})
