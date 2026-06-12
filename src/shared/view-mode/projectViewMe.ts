import type { MemberInfoResponse } from "@/features/auth/api/me"

import type { ViewMode } from "."

export function projectViewMe(
  me: MemberInfoResponse | undefined,
  mode: ViewMode,
): MemberInfoResponse | undefined {
  if (!me) return me
  const records = me.challengerRecords ?? []
  switch (mode) {
    case "admin":
      return { ...me, challengerRecords: [] }
    case "pm":
      return {
        ...me,
        roles: [],
        challengerRecords: records.filter((r) => r.part === "PLAN"),
      }
    case "others":
      return {
        ...me,
        roles: [],
        challengerRecords: records.filter((r) => r.part !== "PLAN"),
      }
  }
}
