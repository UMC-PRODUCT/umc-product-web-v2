export type ProjectDetailCtaMode =
  | "recruit-questions"
  | "my-application"
  | "apply"
  | "apply-blocked-other"
  | "apply-blocked-approved"
  | "plan-only"

interface ResolveCtaParams {
  isOperator: boolean
  isPm: boolean
  isSameBranch: boolean
  isApplied: boolean
  hasOtherActiveApplication: boolean
  isAlreadyApproved: boolean
}

export function resolveProjectDetailCtaMode({
  isOperator,
  isPm,
  isSameBranch,
  isApplied,
  hasOtherActiveApplication,
  isAlreadyApproved,
}: ResolveCtaParams): ProjectDetailCtaMode {
  if (isOperator) return "recruit-questions"
  if (!isSameBranch) return "plan-only"
  if (isPm) return "recruit-questions"
  if (isApplied) return "my-application"
  if (isAlreadyApproved) return "apply-blocked-approved"
  if (hasOtherActiveApplication) return "apply-blocked-other"
  return "apply"
}
