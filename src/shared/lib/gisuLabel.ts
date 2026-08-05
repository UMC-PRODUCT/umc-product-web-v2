/**
 * 기수를 영어 서수로 표기한다. 사이드바 상단 라벨이 디자인상 `UMC 11th` 형태다.
 * 11·12·13 은 1·2·3 으로 끝나도 th 를 쓴다.
 */
export function toGenerationOrdinal(generation: number): string {
  const teens = generation % 100
  if (teens >= 11 && teens <= 13) return `${generation}th`

  switch (generation % 10) {
    case 1:
      return `${generation}st`
    case 2:
      return `${generation}nd`
    case 3:
      return `${generation}rd`
    default:
      return `${generation}th`
  }
}

export function toUmcGisuLabel(
  generation: number | null | undefined,
): string | undefined {
  if (generation == null) return undefined
  return `UMC ${toGenerationOrdinal(generation)}`
}

export function toDemoDayLabel(
  generation: number | null | undefined,
): string | undefined {
  if (generation == null) return undefined
  return `${toGenerationOrdinal(generation)} Demo Day`
}
