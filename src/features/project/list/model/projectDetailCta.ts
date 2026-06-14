export type ProjectDetailCtaMode =
  | "recruit-questions"
  | "my-application"
  | "apply"
  | "apply-blocked-other"
  | "apply-blocked-approved"
  | "apply-blocked-part"
  | "apply-blocked-closed"
  | "plan-only"

interface ResolveCtaParams {
  isOperator: boolean
  isPm: boolean
  isSameBranch: boolean
  isApplied: boolean
  isDraftApplication?: boolean
  hasOtherActiveApplication: boolean
  isAlreadyApproved: boolean
  isPartIneligible: boolean
  isPartRecruitClosed: boolean
}

export function resolveProjectDetailCtaMode({
  isOperator,
  isPm,
  isSameBranch,
  isApplied,
  isDraftApplication = false,
  hasOtherActiveApplication,
  isAlreadyApproved,
  isPartIneligible,
  isPartRecruitClosed,
}: ResolveCtaParams): ProjectDetailCtaMode {
  if (isOperator) return "recruit-questions"
  if (!isSameBranch) return "plan-only"
  if (isPm) return "recruit-questions"
  if (isApplied && isDraftApplication) return "apply"
  if (isApplied) return "my-application"
  if (isAlreadyApproved) return "apply-blocked-approved"
  if (hasOtherActiveApplication) return "apply-blocked-other"
  if (isPartIneligible) return "apply-blocked-part"
  if (isPartRecruitClosed) return "apply-blocked-closed"
  return "apply"
}

interface ApplyButtonDisabledParams {
  isPmReadonly: boolean
  isDetailLoading: boolean
  hasApplicationForm: boolean
  isWritePermissionLoading: boolean
  canWriteApplication: boolean
  hasActiveRound: boolean
  isApplicationStatusResolving: boolean
}

export function isApplyButtonDisabled({
  isPmReadonly,
  isDetailLoading,
  hasApplicationForm,
  isWritePermissionLoading,
  canWriteApplication,
  hasActiveRound,
  isApplicationStatusResolving,
}: ApplyButtonDisabledParams): boolean {
  if (isPmReadonly) return false
  return (
    (!isDetailLoading && !hasApplicationForm) ||
    isWritePermissionLoading ||
    !canWriteApplication ||
    !hasActiveRound ||
    isApplicationStatusResolving
  )
}

type ApplicationForSelection = {
  projectId: string
  status: string
  applicationId: string | null
  matchingRound: { id: string | null }
}

interface SelectCurrentApplicationParams<T extends ApplicationForSelection> {
  applications: T[] | undefined
  projectId: number
  activeMatchingRoundId: string | null | undefined
}

export function selectCurrentApplicationForProject<
  T extends ApplicationForSelection,
>({
  applications,
  projectId,
  activeMatchingRoundId,
}: SelectCurrentApplicationParams<T>): T | undefined {
  const candidates = applications?.filter(
    (a) =>
      Number(a.projectId) === projectId &&
      a.status !== "CANCELLED" &&
      a.applicationId != null,
  )
  if (candidates == null || candidates.length === 0) return undefined
  if (activeMatchingRoundId === undefined) return undefined
  if (activeMatchingRoundId === null) return candidates[0]
  return candidates.find(
    (a) => Number(a.matchingRound?.id) === Number(activeMatchingRoundId),
  )
}

type ApplicationForApprovalCheck = {
  status: string
  matchingRound: { id: string | null }
}

export function selectIsAlreadyApproved<T extends ApplicationForApprovalCheck>(
  applications: T[] | undefined,
): boolean {
  return (
    applications?.some(
      (a) => a.status === "APPROVED" && a.matchingRound.id != null,
    ) ?? false
  )
}
