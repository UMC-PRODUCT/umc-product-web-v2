import type { MemberInfoResponse } from "@/features/auth/api/me"
import type { ChallengerInfoResponse } from "@/features/challenger/model/types"

export function getCurrentGisuChallengerRecords(
  me: MemberInfoResponse | undefined,
): ChallengerInfoResponse[] {
  const current = me?.currentGisuMemberInfo
  const currentChallenger = current?.challenger
  if (!current?.gisuId || !currentChallenger?.challengerId) return []

  const currentGisuId = String(current.gisuId)
  const currentChallengerId = String(currentChallenger.challengerId)
  return (me?.challengerRecords ?? []).filter(
    (record) =>
      String(record.gisuId) === currentGisuId &&
      String(record.challengerId) === currentChallengerId,
  )
}
