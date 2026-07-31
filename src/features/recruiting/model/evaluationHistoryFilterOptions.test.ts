import { describe, expect, it } from "vitest"

import {
  buildHistoryChapterOptions,
  buildHistorySchoolOptions,
  DEFAULT_EVALUATION_HISTORY_FILTERS,
  toDecisionHistoriesQuery,
} from "./evaluationHistory"

import type {
  EvaluationHistoryEntry,
  EvaluationHistoryFilters,
} from "./evaluationHistory"

function row(
  chapter: string,
  school: string,
  name = "지원자",
): EvaluationHistoryEntry {
  return {
    id: `${chapter}-${school}-${name}`,
    processedAt: "2026-07-30T10:00:00Z",
    applicant: {
      chapterId: chapter,
      schoolId: school,
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

  // 서버가 단일 ID 만 받아서 하나만 고른 경우에만 전달할 수 있다.
  it("지부를 하나만 고르면 chapterId 를 보낸다", () => {
    const query = toDecisionHistoriesQuery(
      filters({ chapters: ["Neon"] }),
      "latest",
      false,
      rows,
    )

    expect(query.chapterId).toBe("Neon")
  })

  it("지부를 둘 이상 고르면 chapterId 를 보내지 않는다", () => {
    const query = toDecisionHistoriesQuery(
      filters({ chapters: ["Neon", "Chromium"] }),
      "latest",
      false,
      rows,
    )

    expect(query.chapterId).toBeUndefined()
  })

  it("지부 탭으로 좁혀졌으면 그 지부를 쓴다", () => {
    const query = toDecisionHistoriesQuery(
      filters({ chapterTab: "Ferrum" }),
      "latest",
      false,
      rows,
    )

    expect(query.chapterId).toBe("Ferrum")
  })

  it("학교를 하나만 고르면 schoolId 를 보낸다", () => {
    const query = toDecisionHistoriesQuery(
      filters({ schools: ["광운대학교"] }),
      "latest",
      false,
      rows,
    )

    expect(query.schoolId).toBe("광운대학교")
  })

  it("정렬과 담당자별 그룹을 옮긴다", () => {
    const query = toDecisionHistoriesQuery(filters(), "oldest", true, rows)

    expect(query.sort).toBe("OLDEST")
    expect(query.groupByDecider).toBe(true)
  })
})
