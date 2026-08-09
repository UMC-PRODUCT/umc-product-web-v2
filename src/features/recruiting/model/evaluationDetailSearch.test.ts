import { describe, expect, it } from "vitest"

import { validateEvaluationDetailSearch } from "./evaluationDetailSearch"

describe("validateEvaluationDetailSearch", () => {
  it("문자열 roundId 를 그대로 쓴다", () => {
    expect(validateEvaluationDetailSearch({ roundId: "13" })).toEqual({
      roundId: "13",
    })
  })

  // 라우터는 따옴표 없는 값을 숫자로 파싱한다. 주소를 직접 치거나 붙여넣으면
  // roundId 가 숫자로 들어오는데, 문자열만 받으면 통째로 버려져 지원서를
  // 불러오지 못한다.
  it("숫자 roundId 도 문자열로 받아들인다", () => {
    expect(validateEvaluationDetailSearch({ roundId: 13 })).toEqual({
      roundId: "13",
    })
  })

  it("값이 없거나 비었으면 undefined", () => {
    expect(validateEvaluationDetailSearch({}).roundId).toBeUndefined()
    expect(
      validateEvaluationDetailSearch({ roundId: "" }).roundId,
    ).toBeUndefined()
    expect(
      validateEvaluationDetailSearch({ roundId: null }).roundId,
    ).toBeUndefined()
  })

  it("숫자가 아닌 값은 버린다", () => {
    expect(
      validateEvaluationDetailSearch({ roundId: true }).roundId,
    ).toBeUndefined()
    expect(
      validateEvaluationDetailSearch({ roundId: { id: 13 } }).roundId,
    ).toBeUndefined()
    expect(
      validateEvaluationDetailSearch({ roundId: NaN }).roundId,
    ).toBeUndefined()
  })
})
