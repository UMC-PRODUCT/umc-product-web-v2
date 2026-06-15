import type { MemberInfoResponse } from "@/features/auth/api/me"

import type { ViewMode } from "."

export function projectViewMe(
  me: MemberInfoResponse | undefined,
  _mode: ViewMode,
): MemberInfoResponse | undefined {
  return me
}
