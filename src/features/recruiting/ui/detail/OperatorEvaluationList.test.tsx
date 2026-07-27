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

  it("내가 평가자가 아니어도 전달받은 평가는 그대로 보여준다", () => {
    render(
      <OperatorEvaluationList
        evaluation={buildEvaluation([
          buildOperator({
            evaluatorId: "other",
            evaluatorName: "김운영",
            progress: "done",
            result: "pass",
            comment: "적합합니다",
          }),
        ])}
      />,
    )

    expect(screen.getByText("김운영")).toBeInTheDocument()
    expect(screen.getByText("적합합니다")).toBeInTheDocument()
    expect(
      screen.queryByText("나의 평가를 등록 후에 확인할 수 있습니다."),
    ).not.toBeInTheDocument()
  })

  it("관리 권한이 없으면 총원을 알 수 없어 분모를 감춘다", () => {
    render(
      <OperatorEvaluationList
        evaluation={buildEvaluation([
          buildOperator({
            evaluatorId: "me",
            evaluatorName: "나",
            progress: "done",
            result: "pass",
          }),
        ])}
      />,
    )

    const heading = screen.getByRole("heading", { name: /운영진 평가/ })
    expect(heading.textContent).toBe("운영진 평가 1")
  })

  it("관리 권한이 있으면 총원을 함께 보여준다", () => {
    render(
      <OperatorEvaluationList
        viewerIsAdmin
        evaluation={buildEvaluation([
          buildOperator({
            evaluatorId: "a",
            progress: "done",
            result: "pass",
          }),
          buildOperator({ evaluatorId: "b" }),
        ])}
      />,
    )

    const heading = screen.getByRole("heading", { name: /운영진 평가/ })
    expect(heading.textContent).toBe("운영진 평가 1/2")
  })

  it("평가자가 아닌 운영진에게 평가 등록 안내를 보여주지 않는다", () => {
    render(
      <OperatorEvaluationList
        viewerIsAdmin
        evaluation={buildEvaluation([buildOperator({ evaluatorId: "other" })])}
      />,
    )

    expect(screen.getByText("현재 완료된 평가가 없습니다.")).toBeInTheDocument()
    expect(
      screen.queryByText("나의 평가를 등록 후에 확인할 수 있습니다."),
    ).not.toBeInTheDocument()
  })
})
