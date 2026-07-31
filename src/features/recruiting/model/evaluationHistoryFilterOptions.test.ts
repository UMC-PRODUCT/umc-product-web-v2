import { describe, expect, it } from "vitest"

import {
  buildHistoryChapterOptions,
  buildHistorySchoolOptions,
} from "./evaluationHistory"

import type { EvaluationHistoryEntry } from "./evaluationHistory"

function row(
  chapter: string,
  school: string,
  name = "지원자",
): EvaluationHistoryEntry {
  return {
    id: `${chapter}-${school}-${name}`,
    processedAt: "2026-07-30T10:00:00Z",
    applicant: { chapter, school, name, part: "pm", result: "pass" },
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
