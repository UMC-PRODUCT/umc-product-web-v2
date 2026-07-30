import { describe, expect, it } from "vitest"

import { shortenSchoolName } from "./formatSchoolName"

describe("shortenSchoolName", () => {
  it.each([
    ["가천대학교", "가천대"],
    ["가톨릭대학교", "가톨릭대"],
    ["숭실대학교", "숭실대"],
    ["한국공학대학교", "한국공학대"],
    ["동양미래대학교", "동양미래대"],
  ])("%s -> %s", (input, expected) => {
    expect(shortenSchoolName(input)).toBe(expected)
  })

  it.each([
    ["덕성여자대학교", "덕성여대"],
    ["서울여자대학교", "서울여대"],
    ["이화여자대학교", "이화여대"],
  ])("여자대학교를 여대로 줄인다: %s -> %s", (input, expected) => {
    expect(shortenSchoolName(input)).toBe(expected)
  })

  it("외국어대학교를 외대로 줄인다", () => {
    expect(shortenSchoolName("한국외국어대학교")).toBe("한국외대")
  })

  // 캠퍼스 표기가 붙은 학교는 캠퍼스만 떼고 지역명을 남긴다.
  it.each([
    ["홍익대학교 서울캠퍼스", "홍익대 서울"],
    ["홍익대학교 세종캠퍼스", "홍익대 세종"],
  ])("캠퍼스 표기를 제거한다: %s -> %s", (input, expected) => {
    expect(shortenSchoolName(input)).toBe(expected)
  })

  it("정식 명칭 뒤에 영문 캠퍼스명이 붙어도 유지한다", () => {
    expect(shortenSchoolName("한양대학교 ERICA")).toBe("한양대 ERICA")
  })

  it("이미 줄인 이름은 그대로 둔다", () => {
    expect(shortenSchoolName("가천대")).toBe("가천대")
  })

  it("빈 문자열은 그대로 반환한다", () => {
    expect(shortenSchoolName("")).toBe("")
  })
})
