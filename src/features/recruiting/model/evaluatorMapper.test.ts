import { describe, expect, it } from "vitest"

import { toApiStage, toOperatorEvaluations } from "./evaluatorMapper"

import type { RecruitingEvaluation } from "../api/types"

function evaluation(
  overrides: Partial<RecruitingEvaluation> & { evaluatorMemberId: string },
): RecruitingEvaluation {
  return {
    id: "1",
    applicationId: "500",
    stage: "DOCUMENT",
    decision: "APPROVED",
    comment: null,
    submittedAt: "2026-07-21T09:00:00",
    ...overrides,
  }
}

const NAMES = new Map([
  ["7", "박운영"],
  ["8", "최운영"],
  ["9", "정운영"],
])

describe("toOperatorEvaluations", () => {
  it("평가하지 않은 평가자도 목록에 남긴다", () => {
    const operators = toOperatorEvaluations(
      [
        { id: "1", roundId: "3", memberId: "7" },
        { id: "2", roundId: "3", memberId: "8" },
      ],
      [evaluation({ evaluatorMemberId: "7", comment: "좋습니다" })],
      NAMES,
      "document",
    )

    expect(operators).toEqual([
      {
        evaluatorId: "7",
        evaluatorName: "박운영",
        stage: "document",
        progress: "done",
        result: "pass",
        comment: "좋습니다",
      },
      {
        evaluatorId: "8",
        evaluatorName: "최운영",
        stage: "document",
        progress: "before",
        result: null,
        comment: null,
      },
    ])
  })

  it("REJECTED 를 불합격으로 옮긴다", () => {
    const [operator] = toOperatorEvaluations(
      [{ id: "1", roundId: "3", memberId: "7" }],
      [evaluation({ evaluatorMemberId: "7", decision: "REJECTED" })],
      NAMES,
      "interview",
    )

    expect(operator?.result).toBe("fail")
  })

  it("평가자 명단에서 빠졌어도 제출한 평가는 유지한다", () => {
    const operators = toOperatorEvaluations(
      [{ id: "1", roundId: "3", memberId: "7" }],
      [
        evaluation({ evaluatorMemberId: "7" }),
        evaluation({ evaluatorMemberId: "9", id: "2" }),
      ],
      NAMES,
      "document",
    )

    expect(operators.map((operator) => operator.evaluatorId)).toEqual([
      "7",
      "9",
    ])
  })

  it("memberId 가 숫자로 와도 평가를 붙인다", () => {
    const [operator] = toOperatorEvaluations(
      [{ id: "1", roundId: "3", memberId: 7 as unknown as string }],
      [evaluation({ evaluatorMemberId: 7 as unknown as string })],
      NAMES,
      "document",
    )

    expect(operator).toMatchObject({ evaluatorId: "7", progress: "done" })
  })

  it("프로필을 못 받은 평가자는 대체 이름을 쓴다", () => {
    const [operator] = toOperatorEvaluations(
      [{ id: "1", roundId: "3", memberId: "99" }],
      [],
      NAMES,
      "document",
    )

    expect(operator?.evaluatorName).toBe("이름 없음")
  })
})

describe("toApiStage", () => {
  it("최종 단계에는 평가 API 가 없다", () => {
    expect(toApiStage("document")).toBe("DOCUMENT")
    expect(toApiStage("interview")).toBe("INTERVIEW")
    expect(toApiStage("final")).toBeUndefined()
  })
})
