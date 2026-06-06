import { act, renderHook } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { getScaleTextKey, isItemAnswered } from "./types"
import { useMultistepSurvey } from "./useMultistepSurvey"

import type { SurveyItem, SurveyVariantConfig } from "./types"

const config: SurveyVariantConfig = {
  steps: [
    {
      title: "step1",
      footer: "next-only",
      progressive: true,
      items: [
        {
          id: "q1",
          kind: "emoji-scale",
          text: "q1",
          scores: [5, 3, 1],
          labels: ["a", "b", "c"],
        },
        { id: "q2", kind: "text", text: "q2", placeholder: "", optional: true },
      ],
    },
    {
      title: "step2",
      footer: "submit-only",
      items: [
        {
          id: "q3",
          kind: "emoji-choice",
          text: "q3",
          positiveLabel: "y",
          negativeLabel: "n",
        },
      ],
    },
  ],
}

describe("isItemAnswered", () => {
  it("divider와 optional 문항은 항상 충족으로 본다", () => {
    const divider: SurveyItem = { kind: "divider", id: "d" }
    const optional: SurveyItem = {
      id: "t",
      kind: "text",
      text: "",
      placeholder: "",
      optional: true,
    }
    expect(isItemAnswered(divider, {})).toBe(true)
    expect(isItemAnswered(optional, {})).toBe(true)
  })

  it("필수 문항은 응답 값 유무로 판단한다", () => {
    const scale: SurveyItem = {
      id: "q1",
      kind: "emoji-scale",
      text: "",
      scores: [5],
      labels: [""],
    }
    expect(isItemAnswered(scale, {})).toBe(false)
    expect(isItemAnswered(scale, { q1: null })).toBe(false)
    expect(isItemAnswered(scale, { q1: 5 })).toBe(true)
  })

  it("빈 문자열은 미응답으로 본다", () => {
    const text: SurveyItem = {
      id: "t",
      kind: "text",
      text: "",
      placeholder: "",
    }
    expect(isItemAnswered(text, { t: "" })).toBe(false)
    expect(isItemAnswered(text, { t: "x" })).toBe(true)
  })
})

describe("getScaleTextKey", () => {
  it("__text 접미사를 붙인다", () => {
    expect(getScaleTextKey("info")).toBe("info__text")
  })
})

describe("useMultistepSurvey", () => {
  it("초기 상태: 첫 스텝, startNumber 1, 미완료", () => {
    const { result } = renderHook(() => useMultistepSurvey(config))
    expect(result.current.currentStep.title).toBe("step1")
    expect(result.current.startNumber).toBe(1)
    expect(result.current.totalSteps).toBe(2)
    expect(result.current.isLastStep).toBe(false)
    expect(result.current.isStepComplete).toBe(false)
  })

  it("필수 문항 응답 시 isStepComplete가 true (optional 무관)", () => {
    const { result } = renderHook(() => useMultistepSurvey(config))
    act(() => result.current.onAnswer("q1", 5))
    expect(result.current.isStepComplete).toBe(true)
  })

  it("goNext 시 다음 스텝으로 이동하고 startNumber가 누적된다", () => {
    const { result } = renderHook(() => useMultistepSurvey(config))
    act(() => result.current.onAnswer("q1", 5))
    act(() => result.current.goNext())
    expect(result.current.currentStep.title).toBe("step2")
    expect(result.current.startNumber).toBe(3)
    expect(result.current.isLastStep).toBe(true)
  })

  it("submit은 onSubmit에 현재 answers를 전달한다", () => {
    const onSubmit = vi.fn()
    const { result } = renderHook(() =>
      useMultistepSurvey(config, { onSubmit }),
    )
    act(() => result.current.onAnswer("q1", 5))
    act(() => result.current.submit())
    expect(onSubmit).toHaveBeenCalledWith({ q1: 5 })
  })

  it("reset은 스텝과 응답을 초기화한다", () => {
    const { result } = renderHook(() => useMultistepSurvey(config))
    act(() => result.current.onAnswer("q1", 5))
    act(() => result.current.goNext())
    act(() => result.current.reset())
    expect(result.current.currentStep.title).toBe("step1")
    expect(result.current.answers).toEqual({})
  })
})
