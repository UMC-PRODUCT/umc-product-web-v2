import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { OperatorEvaluationList } from "./OperatorEvaluationList"

import type {
  OperatorEvaluation,
  StageEvaluationDetail,
} from "../../model/applicationDetail"

function buildOperator(
  overrides: Partial<OperatorEvaluation> & { evaluatorId: string },
): OperatorEvaluation {
  return {
    evaluatorName: "운영진",
    stage: "document",
    progress: "before",
    result: null,
    comment: null,
    ...overrides,
  }
}

function buildEvaluation(
  operators: OperatorEvaluation[],
): StageEvaluationDetail {
  return {
    stage: "document",
    myEvaluatorId: "me",
    locked: false,
    operators,
  }
}

describe("OperatorEvaluationList", () => {
  it("내 평가를 등록하기 전에는 목록을 감춘다", () => {
    render(
      <OperatorEvaluationList
        evaluation={buildEvaluation([
          buildOperator({ evaluatorId: "me", evaluatorName: "나" }),
          buildOperator({ evaluatorId: "other", evaluatorName: "김운영" }),
        ])}
      />,
    )

    expect(
      screen.getByText("나의 평가를 등록 후에 확인할 수 있습니다."),
    ).toBeInTheDocument()
    expect(screen.queryByText("김운영")).not.toBeInTheDocument()
  })

  it("내 평가만 완료되고 다른 운영진 완료 건이 없으면 안내 문구를 보여준다", () => {
    render(
      <OperatorEvaluationList
        evaluation={buildEvaluation([
          buildOperator({
            evaluatorId: "me",
            evaluatorName: "나",
            progress: "done",
            result: "pass",
          }),
          buildOperator({ evaluatorId: "other", evaluatorName: "김운영" }),
        ])}
      />,
    )

    expect(screen.getByText("현재 완료된 평가가 없습니다.")).toBeInTheDocument()
  })

  it("다른 운영진의 완료 건이 있으면 목록과 코멘트를 보여준다", () => {
    render(
      <OperatorEvaluationList
        evaluation={buildEvaluation([
          buildOperator({
            evaluatorId: "me",
            evaluatorName: "나",
            progress: "done",
            result: "pass",
          }),
          buildOperator({
            evaluatorId: "other",
            evaluatorName: "김운영",
            progress: "done",
            result: "fail",
            comment: "역량 부족",
          }),
        ])}
      />,
    )

    expect(screen.getByText("김운영")).toBeInTheDocument()
    expect(screen.getByText("역량 부족")).toBeInTheDocument()
    expect(
      screen.queryByText("현재 완료된 평가가 없습니다."),
    ).not.toBeInTheDocument()
  })
})
