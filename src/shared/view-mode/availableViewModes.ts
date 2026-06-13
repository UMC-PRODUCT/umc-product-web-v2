import { isAnyOperator } from "@/features/auth/model/identity"

import { getCurrentGisuChallengerRecords } from "./currentGisuRecords"

import type { MemberInfoResponse } from "@/features/auth/api/me"

import type { ViewMode } from "."

export function computeAvailableViewModes(
  me: MemberInfoResponse | undefined,
): ViewMode[] {
  if (!me) return []
  const modes: ViewMode[] = []
  if (isAnyOperator(me)) modes.push("admin")
  const records = getCurrentGisuChallengerRecords(me)
  if (records.some((r) => r.part === "PLAN")) modes.push("pm")
  if (records.some((r) => r.part !== "PLAN")) modes.push("others")
  return modes
}
