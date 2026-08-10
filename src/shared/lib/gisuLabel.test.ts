import { describe, expect, it } from "vitest"

import {
  toDemoDayLabel,
  toGenerationOrdinal,
  toUmcGisuLabel,
} from "./gisuLabel"

describe("toGenerationOrdinal", () => {
  // 현재 운영 중인 기수대
  it("10기대는 th 를 쓴다", () => {
    expect(toGenerationOrdinal(10)).toBe("10th")
    expect(toGenerationOrdinal(11)).toBe("11th")
    expect(toGenerationOrdinal(12)).toBe("12th")
    expect(toGenerationOrdinal(13)).toBe("13th")
  })

  // 11·12·13 만 예외라 21 부터 다시 갈린다
  it("20기대부터는 끝자리를 따른다", () => {
    expect(toGenerationOrdinal(21)).toBe("21st")
    expect(toGenerationOrdinal(22)).toBe("22nd")
    expect(toGenerationOrdinal(23)).toBe("23rd")
    expect(toGenerationOrdinal(24)).toBe("24th")
  })

  it("한 자리 기수", () => {
    expect(toGenerationOrdinal(1)).toBe("1st")
    expect(toGenerationOrdinal(2)).toBe("2nd")
    expect(toGenerationOrdinal(3)).toBe("3rd")
    expect(toGenerationOrdinal(4)).toBe("4th")
  })
})

describe("라벨 조합", () => {
  it("기수를 아직 못 받았으면 undefined 를 준다", () => {
    // 빈 문자열을 주면 사이드바 상단이 흔들려서 호출부가 구분할 수 있어야 한다
    expect(toUmcGisuLabel(null)).toBeUndefined()
    expect(toUmcGisuLabel(undefined)).toBeUndefined()
    expect(toDemoDayLabel(null)).toBeUndefined()
  })

  it("기수가 있으면 각 화면 표기로 만든다", () => {
    expect(toUmcGisuLabel(11)).toBe("UMC 11th")
    expect(toDemoDayLabel(11)).toBe("11th Demo Day")
  })
})
