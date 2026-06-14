import { getCurrentGisuChallengerRecords } from "./currentGisuRecords"
import { isOtherChallengerPart, isPmPart } from "./viewModeParts"

import type { MemberInfoResponse } from "@/features/auth/api/me"

import type { ViewMode } from "."

export function projectViewMe(
  me: MemberInfoResponse | undefined,
  mode: ViewMode,
): MemberInfoResponse | undefined {
  if (!me) return me
  const records = getCurrentGisuChallengerRecords(me)
  switch (mode) {
    case "admin":
      return { ...me, challengerRecords: [] }
    case "pm":
      return {
        ...me,
        roles: [],
        challengerRecords: records.filter((r) => isPmPart(r.part)),
      }
    case "others":
      return {
        ...me,
        roles: [],
        challengerRecords: records.filter((r) => isOtherChallengerPart(r.part)),
      }
  }
}
