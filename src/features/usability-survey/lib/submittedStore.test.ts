import { beforeEach, describe, expect, it } from "vitest"

import {
  clearSubmittedTemplates,
  hasSubmittedTemplate,
  markTemplateSubmitted,
} from "./submittedStore"

const STORAGE_KEY = "usability-survey:submitted-templates"

describe("submittedStore", () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it("기록하지 않은 templateId는 false를 반환한다", () => {
    expect(hasSubmittedTemplate(5)).toBe(false)
  })

  it("mark 후 같은 templateId는 true를 반환한다", () => {
    markTemplateSubmitted(5)
    expect(hasSubmittedTemplate(5)).toBe(true)
    expect(hasSubmittedTemplate(3)).toBe(false)
  })

  it("여러 templateId를 누적 기록한다", () => {
    markTemplateSubmitted(1)
    markTemplateSubmitted(3)
    expect(hasSubmittedTemplate(1)).toBe(true)
    expect(hasSubmittedTemplate(3)).toBe(true)
  })

  it("같은 templateId를 중복 기록해도 한 번만 저장한다", () => {
    markTemplateSubmitted(5)
    markTemplateSubmitted(5)
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]")).toEqual([5])
  })

  it("손상된 JSON이 저장돼 있어도 안전하게 false를 반환한다", () => {
    localStorage.setItem(STORAGE_KEY, "not-json")
    expect(hasSubmittedTemplate(5)).toBe(false)
  })

  it("clearSubmittedTemplates는 기록을 모두 삭제한다", () => {
    markTemplateSubmitted(1)
    markTemplateSubmitted(3)

    clearSubmittedTemplates()

    expect(hasSubmittedTemplate(1)).toBe(false)
    expect(hasSubmittedTemplate(3)).toBe(false)
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull()
  })
})
