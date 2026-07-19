import type { Chapter } from "@/entities/organization/model/chapters"
import type { PartTag } from "@/shared/model/domain"

import type { EvaluationProgress, EvaluationResult } from "./applicantListTypes"
import type { EvaluationStage } from "./evaluationStage"

export type ApplicationQuestionType =
  | "shortText"
  | "longText"
  | "radio"
  | "checkbox"
  | "dropdown"
  | "file"
  | "portfolio"

export interface ApplicationQuestionOption {
  optionId: string
  content: string
}

export interface ApplicationQuestionFile {
  fileId: string
  name: string
  url: string
}

export interface ApplicationQuestion {
  questionId: string
  type: ApplicationQuestionType
  title: string
  description?: string
  required: boolean
  options: ApplicationQuestionOption[]
  textValue: string | null
  selectedOptionIds: string[]
  files: ApplicationQuestionFile[]
}

export interface ApplicationSection {
  sectionId: string
  type: "common" | "part"
  title: string
  questions: ApplicationQuestion[]
}

export interface OperatorEvaluation {
  evaluatorId: string
  evaluatorName: string
  stage: EvaluationStage
  progress: EvaluationProgress
  result: EvaluationResult | null
  comment: string | null
}

export interface StageEvaluationDetail {
  stage: EvaluationStage
  myEvaluatorId: string
  locked: boolean
  lockReason?: string
  operators: OperatorEvaluation[]
}

export interface ApplicationDetail {
  applicationId: string
  applicantName: string
  chapter: Chapter
  school: string
  recruitmentLabel: string
  parts: PartTag[]
  reachedStages: EvaluationStage[]
  finalResult: EvaluationResult | null
  sections: ApplicationSection[]
  evaluations: Record<EvaluationStage, StageEvaluationDetail | null>
}

export function getStageEvaluationDetail(
  detail: ApplicationDetail,
  stage: EvaluationStage,
) {
  return detail.evaluations[stage]
}

export function getMyEvaluation(evaluation: StageEvaluationDetail) {
  return evaluation.operators.find(
    (operator) => operator.evaluatorId === evaluation.myEvaluatorId,
  )
}

export function countOperatorProgress(operators: OperatorEvaluation[]) {
  const total = operators.length
  const done = operators.filter(
    (operator) => operator.progress === "done",
  ).length
  return { done, total }
}
