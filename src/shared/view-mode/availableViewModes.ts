import { isAnyOperator } from "@/features/auth/model/identity"

import { getCurrentGisuChallengerRecords } from "./currentGisuRecords"
import { isOtherChallengerPart, isPmPart } from "./viewModeParts"

import type { MemberInfoResponse } from "@/features/auth/api/me"

import type { ViewMode } from "."

export function computeAvailableViewModes(
  me: MemberInfoResponse | undefined,
): ViewMode[] {
  if (!me) return []
  const modes: ViewMode[] = []
  if (isAnyOperator(me)) modes.push("admin")
  const records = getCurrentGisuChallengerRecords(me)
  if (records.some((r) => isPmPart(r.part))) modes.push("pm")
  if (records.some((r) => isOtherChallengerPart(r.part))) modes.push("others")
  return modes
}

export function resolveAvailableViewMode(
  mode: ViewMode,
  availableModes: ViewMode[],
): ViewMode {
  const defaultMode = availableModes[0]
  if (defaultMode != null && !availableModes.includes(mode)) return defaultMode
  return mode
}
