import type { ProjectDetail } from "@/entities/project/api/matchingProject"

export type ProjectDetailCtaMode =
  | "guest"
  | "recruit-questions"
  | "my-application"
  | "apply"
  | "apply-blocked-other"
  | "apply-blocked-approved"
  | "apply-blocked-part"
  | "apply-blocked-closed"
  | "other-branch"
  | "no-active-round"
  | "plan-only"

interface ResolveCtaParams {
  isGuest?: boolean
  isOperator: boolean
  isPm: boolean
  isSameBranch: boolean
  isApplied: boolean
  isDraftApplication?: boolean
  hasOtherActiveApplication: boolean
  isAlreadyApproved: boolean
  isPartIneligible: boolean
  isPartRecruitClosed: boolean
  hasActiveRound?: boolean
}

export function resolveProjectDetailCtaMode({
  isGuest = false,
  isOperator,
  isPm,
  isSameBranch,
  isApplied,
  isDraftApplication = false,
  hasOtherActiveApplication,
  isAlreadyApproved,
  isPartIneligible,
  isPartRecruitClosed,
  hasActiveRound,
}: ResolveCtaParams): ProjectDetailCtaMode {
  // 게스트는 지부도 지원 이력도 없어 아래 분기가 전부 기본값으로 흐른다.
  // 그대로 두면 지원할 수 없는 사람에게 지원하기가 열리므로 먼저 가른다.
  if (isGuest) return "guest"
  if (isOperator) return "recruit-questions"
  if (isPm) return "recruit-questions"
  if (!isSameBranch) return "other-branch"
  if (isApplied && isDraftApplication) return "apply"
  if (isApplied) return "my-application"
  if (isAlreadyApproved) return "apply-blocked-approved"
  if (hasActiveRound === false) return "no-active-round"
  if (hasOtherActiveApplication) return "apply-blocked-other"
  if (isPartIneligible) return "apply-blocked-part"
  if (isPartRecruitClosed) return "apply-blocked-closed"
  return "apply"
}

type PartQuotaForCta = Pick<
  ProjectDetail["partQuotas"][number],
  "part" | "status"
>

export function selectIsPartIneligible(
  partQuotas: PartQuotaForCta[],
  myPart: string | undefined,
): boolean {
  if (myPart == null) return false
  return !partQuotas.some((q) => q.part === myPart)
}

export function selectIsPartRecruitClosed(
  partQuotas: PartQuotaForCta[],
  myPart: string | undefined,
): boolean {
  if (myPart == null) return false
  return partQuotas.some((q) => q.part === myPart && q.status === "COMPLETED")
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
