import type {
  ApiEvaluationStage,
  RecruitingEvaluation,
  RecruitingRoundEvaluator,
} from "../api/types"
import type { EvaluationResult } from "./applicantListTypes"
import type {
  OperatorEvaluation,
  StageEvaluationDetail,
} from "./applicationDetail"
import type { EvaluationStage } from "./evaluationStage"

const API_STAGE: Partial<Record<EvaluationStage, ApiEvaluationStage>> = {
  document: "DOCUMENT",
  interview: "INTERVIEW",
}

export function toApiStage(
  stage: EvaluationStage,
): ApiEvaluationStage | undefined {
  return API_STAGE[stage]
}

function toResult(
  decision: RecruitingEvaluation["decision"],
): EvaluationResult {
  return decision === "APPROVED" ? "pass" : "fail"
}

// EVALUATION-002 는 제출된 평가만 준다. 평가자 명단(ADMIN-033)과 합쳐야
// 아직 평가하지 않은 운영진이 목록에 나온다.
export function toOperatorEvaluations(
  evaluators: RecruitingRoundEvaluator[],
  evaluations: RecruitingEvaluation[],
  memberNames: Map<string, string>,
  stage: EvaluationStage,
): OperatorEvaluation[] {
  const evaluationByMemberId = new Map(
    evaluations.map((evaluation) => [
      String(evaluation.evaluatorMemberId),
      evaluation,
    ]),
  )
  const memberIds = [
    ...new Set([
      ...evaluators.map((evaluator) => String(evaluator.memberId)),
      ...evaluationByMemberId.keys(),
    ]),
  ]

  return memberIds.map((memberId) => {
    const evaluation = evaluationByMemberId.get(memberId)
    return {
      evaluatorId: memberId,
      evaluatorName: memberNames.get(memberId) ?? "이름 없음",
      stage,
      progress: evaluation ? "done" : "before",
      result: evaluation ? toResult(evaluation.decision) : null,
      comment: evaluation?.comment ?? null,
    }
  })
}

export function toStageEvaluationDetail(
  operators: OperatorEvaluation[],
  stage: EvaluationStage,
  myMemberId: string,
  locked: boolean,
): StageEvaluationDetail {
  return {
    stage,
    myEvaluatorId: myMemberId,
    locked,
    operators,
  }
}
