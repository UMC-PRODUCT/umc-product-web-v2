import { describe, expect, it } from "vitest"

import {
  buildFinalDecisionBody,
  canDecideFinal,
  resolveEvaluationEligibility,
  toAcceptableTracks,
} from "./evaluationRules"

describe("resolveEvaluationEligibility", () => {
  it("평가자가 판정 전 서류를 평가할 수 있다", () => {
    expect(
      resolveEvaluationEligibility("document", "SUBMITTED", "yes"),
    ).toEqual({
      canSubmit: true,
      reason: null,
    })
  })

  it("서류 판정이 끝나면 서류 평가를 막는다", () => {
    expect(
      resolveEvaluationEligibility("document", "INTERVIEW_ASSIGNED", "yes")
        .reason,
    ).toBe("stageClosed")
    expect(
      resolveEvaluationEligibility("document", "DOCUMENT_FAILED", "yes").reason,
    ).toBe("stageClosed")
  })

  it("면접 대상으로 확정된 뒤에만 면접을 평가할 수 있다", () => {
    expect(
      resolveEvaluationEligibility("interview", "INTERVIEW_ASSIGNED", "yes")
        .canSubmit,
    ).toBe(true)
    expect(
      resolveEvaluationEligibility("interview", "SUBMITTED", "yes").reason,
    ).toBe("stageClosed")
    expect(
      resolveEvaluationEligibility("interview", "FINAL_PASSED", "yes").reason,
    ).toBe("stageClosed")
  })

  it("평가자가 아니면 등록할 수 없다", () => {
    expect(
      resolveEvaluationEligibility("document", "SUBMITTED", "no").reason,
    ).toBe("notEvaluator")
  })

  it("최종 전형에는 평가 등록이 없다", () => {
    expect(
      resolveEvaluationEligibility("final", "FINAL_PASSED", "yes").reason,
    ).toBe("stageHasNoEvaluation")
  })

  it("상태를 아직 모르면 등록을 열지 않는다", () => {
    expect(
      resolveEvaluationEligibility("document", undefined, "yes").canSubmit,
    ).toBe(false)
  })

  it("평가자인지 확정하지 못하면 권한 없음과 다르게 안내한다", () => {
    expect(
      resolveEvaluationEligibility("document", "SUBMITTED", "unknown"),
    ).toEqual({ canSubmit: false, reason: "permissionUnknown" })
  })
})

describe("canDecideFinal", () => {
  it("면접 대상자와 면접 생략자를 판정할 수 있다", () => {
    expect(canDecideFinal("INTERVIEW_ASSIGNED", true)).toBe(true)
    expect(canDecideFinal("INTERVIEW_SKIPPED", true)).toBe(true)
  })

  it("이미 최종 결과가 나온 지원서는 다시 판정하지 않는다", () => {
    expect(canDecideFinal("FINAL_PASSED", true)).toBe(false)
    expect(canDecideFinal("FINAL_FAILED", true)).toBe(false)
  })

  it("서류 단계에 머문 지원서는 판정 대상이 아니다", () => {
    expect(canDecideFinal("SUBMITTED", true)).toBe(false)
    expect(canDecideFinal("DOCUMENT_FAILED", true)).toBe(false)
  })

  it("관리 권한이 없으면 판정할 수 없다", () => {
    expect(canDecideFinal("INTERVIEW_ASSIGNED", false)).toBe(false)
  })

  it("상태를 아직 모르면 열지 않는다", () => {
    expect(canDecideFinal(undefined, true)).toBe(false)
  })
})

describe("toAcceptableTracks", () => {
  it("1지망만 있으면 하나만 고를 수 있다", () => {
    expect(
      toAcceptableTracks({ firstChoice: "PLAN", secondChoice: null }),
    ).toEqual(["PLAN"])
  })

  it("2지망이 있으면 둘 다 후보가 된다", () => {
    expect(
      toAcceptableTracks({ firstChoice: "PLAN", secondChoice: "DESIGN" }),
    ).toEqual(["PLAN", "DESIGN"])
  })

  it("1·2지망이 같으면 하나로 접는다", () => {
    expect(
      toAcceptableTracks({ firstChoice: "PLAN", secondChoice: "PLAN" }),
    ).toEqual(["PLAN"])
  })
})

describe("buildFinalDecisionBody", () => {
  it("불합격에는 확정 트랙을 담지 않는다", () => {
    expect(buildFinalDecisionBody("FAIL", "PLAN")).toEqual({ decision: "FAIL" })
    expect(buildFinalDecisionBody("FAIL", null)).toEqual({ decision: "FAIL" })
  })

  it("합격에는 확정 트랙을 담는다", () => {
    expect(buildFinalDecisionBody("PASS", "DESIGN")).toEqual({
      decision: "PASS",
      acceptedTrack: "DESIGN",
    })
  })

  it("확정 트랙 없이 합격 요청을 만들지 않는다", () => {
    expect(buildFinalDecisionBody("PASS", null)).toBeNull()
  })
})
