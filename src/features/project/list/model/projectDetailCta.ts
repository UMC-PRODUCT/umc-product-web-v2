export type ProjectDetailCtaMode =
  | "recruit-questions"
  | "my-application"
  | "apply"
  | "plan-only"

export function resolveProjectDetailCtaMode(
  isOperator: boolean,
  isPm: boolean,
  isSameBranch: boolean,
  isApplied: boolean,
): ProjectDetailCtaMode {
  if (isOperator) return "recruit-questions"
  if (!isSameBranch) return "plan-only"
  if (isPm) return "recruit-questions"
  return isApplied ? "my-application" : "apply"
}
