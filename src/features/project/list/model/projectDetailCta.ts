export type ProjectDetailCtaMode =
  | "recruit-questions"
  | "my-application"
  | "apply"
  | "plan-only"

/** "applied-here": 이 프로젝트에 지원함 / "applied-elsewhere": 다른 프로젝트에 지원함 / "none": 미지원 */
export type ApplicationState = "applied-here" | "applied-elsewhere" | "none"

export function resolveProjectDetailCtaMode(
  isOperator: boolean,
  isPm: boolean,
  isSameBranch: boolean,
  applicationState: ApplicationState,
): ProjectDetailCtaMode {
  if (isOperator) return "recruit-questions"
  if (!isSameBranch) return "plan-only"
  if (isPm) return "recruit-questions"
  return isApplied ? "my-application" : "apply"
}
