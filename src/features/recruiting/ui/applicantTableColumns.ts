import type { EvaluationStage } from "../model/evaluationStage"

export const APPLICANT_COLUMNS = {
  appliedAt: "flex min-w-36 flex-1 items-center justify-center px-6",
  applicant: "flex min-w-27.5 flex-1 items-center px-6",
  chapter: "flex min-w-30 flex-1 items-center px-4",
  school: "flex min-w-30 flex-1 items-center px-4",
  type: "flex min-w-23.5 shrink-0 items-center justify-center px-4",
  parts: "flex min-w-50 flex-1 items-center gap-2 px-4",
  myEvaluation: "flex min-w-27.5 flex-1 items-center justify-center px-4",
  progress: "flex min-w-31 flex-1 items-center gap-2.5 px-4",
  result: "flex min-w-22.5 flex-1 items-center px-6",
} as const

export type ApplicantColumnKey = keyof typeof APPLICANT_COLUMNS

export interface ApplicantColumnOptions {
  hideChapter?: boolean
  hideSchool?: boolean
  showMyEvaluation?: boolean
}

export function getVisibleApplicantColumns(
  stage: EvaluationStage,
  options: ApplicantColumnOptions = {},
): ApplicantColumnKey[] {
  const columns: ApplicantColumnKey[] = []
  if (stage !== "final") columns.push("appliedAt")
  columns.push("applicant")
  if (!options.hideChapter) columns.push("chapter")
  if (!options.hideSchool) columns.push("school")
  columns.push("type", "parts")
  if (options.showMyEvaluation) columns.push("myEvaluation")
  columns.push("progress", "result")
  return columns
}
