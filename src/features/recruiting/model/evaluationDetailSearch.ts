export interface EvaluationDetailSearch {
  roundId: string | undefined
}

/**
 * 라우터는 따옴표 없는 값을 숫자로 파싱한다. 화면끼리 오갈 때는 링크가 문자열로
 * 넣어 주지만, 주소를 직접 치거나 붙여넣으면 `?roundId=13` 이 숫자로 들어온다.
 * 문자열만 받으면 그 값이 통째로 버려져 지원서를 불러오지 못한다.
 */
export function validateEvaluationDetailSearch(
  search: Record<string, unknown>,
): EvaluationDetailSearch {
  const roundId = search.roundId

  if (typeof roundId === "string" && roundId.length > 0) {
    return { roundId }
  }
  if (typeof roundId === "number" && Number.isFinite(roundId)) {
    return { roundId: String(roundId) }
  }
  return { roundId: undefined }
}
