import { describe, expect, it } from "vitest"

import { basicInfoSchema } from "./basicInfoSchema"

function parseLink(value: string | undefined) {
  return basicInfoSchema.safeParse({
    title: "t",
    description: "d",
    externalLink: value,
  })
}

describe("basicInfoSchema title 검증", () => {
  it('공백만 있는 title("   ")은 실패하고 title 경로에 issue 생성', () => {
    const result = basicInfoSchema.safeParse({ title: "   ", description: "d" })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues.some((i) => i.path.includes("title"))).toBe(
        true,
      )
    }
  })
})

describe("basicInfoSchema externalLink 검증", () => {
  describe("유효한 값은 통과", () => {
    it('빈 문자열("")은 통과', () => {
      expect(parseLink("").success).toBe(true)
    })

    it('"figma.com/qa-test"는 통과', () => {
      expect(parseLink("figma.com/qa-test").success).toBe(true)
    })

    it('"https://notion.so/project"는 통과', () => {
      expect(parseLink("https://notion.so/project").success).toBe(true)
    })

    it('"www.example.com"은 통과', () => {
      expect(parseLink("www.example.com").success).toBe(true)
    })

    it('"sub.domain.co.kr"는 통과', () => {
      expect(parseLink("sub.domain.co.kr").success).toBe(true)
    })
  })

  describe("유효하지 않은 값은 실패하고 externalLink 경로에 issue 생성", () => {
    it('"이상한 링크 텍스트" (공백 포함)는 실패', () => {
      const result = parseLink("이상한 링크 텍스트")
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(
          result.error.issues.some((i) => i.path.includes("externalLink")),
        ).toBe(true)
      }
    })

    it('"hello world" (공백 포함)는 실패', () => {
      const result = parseLink("hello world")
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(
          result.error.issues.some((i) => i.path.includes("externalLink")),
        ).toBe(true)
      }
    })

    it('"justtext" (점 없음, TLD 없음)는 실패', () => {
      const result = parseLink("justtext")
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(
          result.error.issues.some((i) => i.path.includes("externalLink")),
        ).toBe(true)
      }
    })

    it('"no-dot-host" (점 없음)는 실패', () => {
      const result = parseLink("no-dot-host")
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(
          result.error.issues.some((i) => i.path.includes("externalLink")),
        ).toBe(true)
      }
    })
  })
})
