import { describe, expect, it } from "vitest"

import {
  applyEvaluationHistoryFilters,
  buildHistoryChapterOptions,
  buildHistorySchoolOptions,
  DEFAULT_EVALUATION_HISTORY_FILTERS,
  toDecisionHistoriesQuery,
} from "./evaluationHistory"

import type {
  EvaluationHistoryEntry,
  EvaluationHistoryFilters,
} from "./evaluationHistory"

// 서버는 지부·학교를 숫자 ID 로 받는데 필터 바는 이름으로 다룬다. 픽스처의 ID 에
// 이름을 넣어 두면 이름을 그대로 보내도 테스트가 통과해 버려서, 이름과 겹치지 않는
// 값을 쓴다.
const CHAPTER_IDS: Record<string, string> = {
  Neon: "27",
  Chromium: "29",
  Ferrum: "31",
}

const SCHOOL_IDS: Record<string, string> = {
  가천대학교: "101",
  인하대학교: "102",
  광운대학교: "103",
  동국대학교: "104",
}

function row(
  chapter: string,
  school: string,
  name = "지원자",
): EvaluationHistoryEntry {
  return {
    id: `${chapter}-${school}-${name}`,
    processedAt: "2026-07-30T10:00:00Z",
    applicant: {
      chapterId: CHAPTER_IDS[chapter] ?? `chapter-${chapter}`,
      schoolId: SCHOOL_IDS[school] ?? `school-${school}`,
      chapter,
      school,
      name,
      part: "pm",
      result: "pass",
    },
    evaluator: {
      id: "1",
      chapter,
      school,
      position: "교내 회장",
      nickname: "회장님",
      name: "박회장",
    },
  }
}

describe("buildHistoryChapterOptions", () => {
  it("응답에 등장한 지부만 중복 없이 만든다", () => {
    const options = buildHistoryChapterOptions([
      row("Neon", "가천대학교"),
      row("Neon", "인하대학교"),
      row("Chromium", "광운대학교"),
    ])

    expect(options).toEqual([
      { value: "Chromium", label: "Chromium" },
      { value: "Neon", label: "Neon" },
    ])
  })

  // 상수(CHAPTERS)는 현재 기수 6개뿐이라 과거 기수 지부가 필터에서 빠졌다.
  it("상수에 없는 과거 기수 지부도 선택지에 넣는다", () => {
    const options = buildHistoryChapterOptions([row("GOAT", "어느대학교")])

    expect(options).toEqual([{ value: "GOAT", label: "GOAT" }])
  })

  it("행이 없으면 빈 배열", () => {
    expect(buildHistoryChapterOptions([])).toEqual([])
  })
})

describe("buildHistorySchoolOptions", () => {
  // 값은 서버 정식 명칭이어야 필터가 걸린다. 화면에 보이는 label 만 약칭이다.
  it("값은 정식 명칭, 라벨은 약칭으로 만든다", () => {
    const options = buildHistorySchoolOptions(
      [row("Neon", "가천대학교"), row("Neon", "동덕여자대학교")],
      [],
    )

    expect(options).toEqual([
      { value: "가천대학교", label: "가천대" },
      { value: "동덕여자대학교", label: "동덕여대" },
    ])
  })

  it("지부를 고르면 그 지부 학교만 남긴다", () => {
    const rows = [
      row("Neon", "가천대학교"),
      row("Chromium", "광운대학교"),
      row("Ferrum", "동국대학교"),
    ]

    expect(
      buildHistorySchoolOptions(rows, ["Neon", "Ferrum"]).map((o) => o.value),
    ).toEqual(["가천대학교", "동국대학교"])
  })

  it("지부를 안 고르면 전체 학교를 준다", () => {
    const rows = [row("Neon", "가천대학교"), row("Chromium", "광운대학교")]

    expect(buildHistorySchoolOptions(rows, []).map((o) => o.value)).toEqual([
      "가천대학교",
      "광운대학교",
    ])
  })

  it("같은 학교가 여러 행에 있어도 한 번만 만든다", () => {
    const options = buildHistorySchoolOptions(
      [row("Neon", "가천대학교", "A"), row("Neon", "가천대학교", "B")],
      [],
    )

    expect(options).toHaveLength(1)
  })

  it("가나다순으로 정렬한다", () => {
    const rows = [
      row("Neon", "한국항공대학교"),
      row("Neon", "가천대학교"),
      row("Neon", "숙명여자대학교"),
    ]

    expect(buildHistorySchoolOptions(rows, []).map((o) => o.label)).toEqual([
      "가천대",
      "숙명여대",
      "한국항공대",
    ])
  })
})

describe("toDecisionHistoriesQuery", () => {
  const rows = [
    row("Neon", "가천대학교"),
    row("Chromium", "광운대학교"),
    row("Ferrum", "동국대학교"),
  ]

  function filters(override: Partial<EvaluationHistoryFilters> = {}) {
    return { ...DEFAULT_EVALUATION_HISTORY_FILTERS, ...override }
  }

  it("파트 다중 선택을 트랙 배열로 옮긴다", () => {
    const query = toDecisionHistoriesQuery(
      filters({ parts: ["pm", "web-pe"] }),
      "latest",
      false,
      rows,
    )

    expect(query.tracks).toEqual(["PLAN", "WEB_PRODUCT_ENGINEER"])
  })

  // 평가 결과는 단일 선택이지만 서버 파라미터는 배열이다.
  it("평가 결과는 단일 값을 배열로 감싸 보낸다", () => {
    expect(
      toDecisionHistoriesQuery(
        filters({ result: "pass" }),
        "latest",
        false,
        rows,
      ).results,
    ).toEqual(["PASSED"])
    expect(
      toDecisionHistoriesQuery(filters(), "latest", false, rows).results,
    ).toBeUndefined()
  })

  // 서버는 숫자 ID 를 받는다. 이름을 그대로 보내면 필터가 통째로 무시된다.
  it("지부 다중 선택을 이름이 아니라 chapterIds 로 옮긴다", () => {
    const query = toDecisionHistoriesQuery(
      filters({ chapters: ["Neon", "Chromium"] }),
      "latest",
      false,
      rows,
    )

    expect(query.chapterIds).toEqual([CHAPTER_IDS.Neon, CHAPTER_IDS.Chromium])
    expect(query.chapterIds).not.toContain("Neon")
  })

  it("학교 다중 선택을 이름이 아니라 schoolIds 로 옮긴다", () => {
    const query = toDecisionHistoriesQuery(
      filters({ schools: ["광운대학교", "동국대학교"] }),
      "latest",
      false,
      rows,
    )

    expect(query.schoolIds).toEqual([
      SCHOOL_IDS["광운대학교"],
      SCHOOL_IDS["동국대학교"],
    ])
    expect(query.schoolIds).not.toContain("광운대학교")
  })

  it("지부 탭으로 좁혀졌으면 그 지부를 쓴다", () => {
    const query = toDecisionHistoriesQuery(
      filters({ chapterTab: "Ferrum" }),
      "latest",
      false,
      rows,
    )

    expect(query.chapterIds).toEqual([CHAPTER_IDS.Ferrum])
  })

  it("아무것도 안 고르면 보내지 않는다", () => {
    const query = toDecisionHistoriesQuery(filters(), "latest", false, rows)

    expect(query.chapterIds).toBeUndefined()
    expect(query.schoolIds).toBeUndefined()
  })

  // 조회 결과에 없는 이름은 매칭할 ID 가 없어 빠진다.
  it("조회 결과에 없는 이름은 제외한다", () => {
    const query = toDecisionHistoriesQuery(
      filters({ chapters: ["Neon", "존재하지않는지부"] }),
      "latest",
      false,
      rows,
    )

    expect(query.chapterIds).toEqual([CHAPTER_IDS.Neon])
  })

  it("정렬과 담당자별 그룹을 옮긴다", () => {
    const query = toDecisionHistoriesQuery(filters(), "oldest", true, rows)

    expect(query.sort).toBe("OLDEST")
    expect(query.groupByDecider).toBe(true)
  })
})

describe("applyEvaluationHistoryFilters - 파트가 null 인 행", () => {
  function rowWithPart(part: EvaluationHistoryEntry["applicant"]["part"]) {
    return {
      ...row("Neon", "가천대학교"),
      applicant: { ...row("Neon", "가천대학교").applicant, part },
    }
  }

  it("파트 필터를 걸면 파트가 없는 행은 빠진다", () => {
    const rows = [rowWithPart("pm"), rowWithPart(null)]
    const result = applyEvaluationHistoryFilters(rows, {
      ...DEFAULT_EVALUATION_HISTORY_FILTERS,
      parts: ["pm"],
    })

    expect(result).toHaveLength(1)
    expect(result[0]?.applicant.part).toBe("pm")
  })

  it("파트 필터가 없으면 파트가 없는 행도 남는다", () => {
    const rows = [rowWithPart("pm"), rowWithPart(null)]

    expect(
      applyEvaluationHistoryFilters(rows, DEFAULT_EVALUATION_HISTORY_FILTERS),
    ).toHaveLength(2)
  })
})
