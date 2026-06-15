import { isAnyOperator } from "@/features/auth/model/identity"

import { getCurrentGisuChallengerRecords } from "./currentGisuRecords"
import { isOtherChallengerPart, isPmPart } from "./viewModeParts"

import type { MemberInfoResponse } from "@/features/auth/api/me"
import type { Part } from "@/features/challenger/model/types"

import type { ViewMode } from "."

export interface ProjectViewContext {
  mode: ViewMode
  isAdminView: boolean
  isPmView: boolean
  isChallengerView: boolean
  currentPart?: Part
  currentGisuId?: string
  currentChapterId?: string
}

export function getProjectViewContext(
  me: MemberInfoResponse | undefined,
  mode: ViewMode,
): ProjectViewContext {
  const records = getCurrentGisuChallengerRecords(me)
  const pmRecord = records.find((record) => isPmPart(record.part))
  const challengerRecord = records.find((record) =>
    isOtherChallengerPart(record.part),
  )
  const currentRecord = pmRecord ?? challengerRecord ?? records[0]
  const isAdminView = mode === "admin" && isAnyOperator(me)
  const isPmView = mode === "pm" && pmRecord != null
  const isChallengerView = mode === "others" && challengerRecord != null

  return {
    mode,
    isAdminView,
    isPmView,
    isChallengerView,
    currentPart: isPmView
      ? pmRecord?.part
      : isChallengerView
        ? challengerRecord?.part
        : currentRecord?.part,
    currentGisuId: currentRecord?.gisuId,
    currentChapterId: currentRecord?.chapterId,
  }
}
