export interface EvaluationDetailSearch {
  roundId: string | undefined
}

export function validateEvaluationDetailSearch(
  search: Record<string, unknown>,
): EvaluationDetailSearch {
  const roundId = search.roundId
  return {
    roundId:
      typeof roundId === "string" && roundId.length > 0 ? roundId : undefined,
  }
}
