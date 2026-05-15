import type { ViewMode } from "@/shared/view-mode"

export type AdminOnlyAction = "updatePartQuotas" | "publishProject"

export function canPerform(
  action: AdminOnlyAction,
  viewMode: ViewMode,
): boolean {
  if (action === "updatePartQuotas" || action === "publishProject") {
    return viewMode === "admin"
  }
  return true
}

export class ClientPermissionError extends Error {
  constructor(public action: AdminOnlyAction) {
    super(`[ClientGuard] "${action}"은 운영진 전용 액션입니다.`)
    this.name = "ClientPermissionError"
  }
}
