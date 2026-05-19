import type { MemberInfoResponse } from "@/features/auth/api/me"
import type { ChallengerInfoResponse } from "@/features/challenger/model/types"

export function isOperator(me: MemberInfoResponse | undefined): boolean {
  return !!me?.roles?.length
}

export function isCurrentTermPm(me: MemberInfoResponse | undefined): boolean {
  if (!me?.challengerRecords?.length) return false
  const latest = latestRecord(me.challengerRecords)
  return latest?.part === "PLAN"
}

export function getViewerBranch(
  me: MemberInfoResponse | undefined,
): string | undefined {
  if (!me?.challengerRecords?.length) return undefined
  return latestRecord(me.challengerRecords)?.chapterName
}

function latestRecord(
  records: ChallengerInfoResponse[],
): ChallengerInfoResponse | undefined {
  return [...records].sort((a, b) => Number(b.gisuId) - Number(a.gisuId))[0]
}
