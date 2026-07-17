export const EVALUATION_STAGES = ["document", "interview", "final"] as const

export type EvaluationStage = (typeof EVALUATION_STAGES)[number]

export const EVALUATION_STAGE_LABEL: Record<EvaluationStage, string> = {
  document: "서류 전형",
  interview: "면접 전형",
  final: "최종 평가",
}

export const EVALUATION_STAGE_DESCRIPTION: Record<EvaluationStage, string> = {
  document: "전체 지원자의 서류 평가 현황과 결과를 확인합니다.",
  interview: "전체 지원자의 면접 평가 현황과 결과를 확인합니다.",
  final: "전체 지원자의 최종 평가 결과를 확인합니다.",
}
