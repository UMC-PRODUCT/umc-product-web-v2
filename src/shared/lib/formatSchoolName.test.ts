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

  // 마지막 /학교$/ 규칙은 앞의 "대학교" 규칙이 먼저 잡아서 실제 학교명에서는
  // 동작하지 않는다. 서버 학교 목록 36개를 전부 넣어봐도 걸리는 이름이 없었다
  // (2026-07-31 확인). 규칙을 지울지 판단하기 전에 어떤 입력에서 동작하는지를
  // 고정해 둔다.
  it("대학교로 끝나지 않고 학교로 끝나면 학교를 뗀다", () => {
    expect(shortenSchoolName("한국예술학교")).toBe("한국예술")
  })

  it("대학교로 끝나면 대학교 규칙이 먼저 잡아 학교 규칙은 타지 않는다", () => {
    expect(shortenSchoolName("가천대학교")).toBe("가천대")
    expect(shortenSchoolName("동양미래대학교")).toBe("동양미래대")
  })

  it("학교가 끝에 없으면 건드리지 않는다", () => {
    expect(shortenSchoolName("학교법인 무슨재단")).toBe("학교법인 무슨재단")
  })
})
