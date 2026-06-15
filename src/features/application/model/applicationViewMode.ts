import type { ViewMode } from "@/shared/view-mode"

export type MatchingApplicationView = "admin" | "pm" | "others" | "none"

interface ResolveMatchingApplicationViewParams {
  mode: ViewMode
  canViewAdminApplications: boolean
  canViewPmApplications: boolean
  canViewOwnApplications: boolean
}

export function resolveMatchingApplicationView({
  mode,
  canViewAdminApplications,
  canViewPmApplications,
  canViewOwnApplications,
}: ResolveMatchingApplicationViewParams): MatchingApplicationView {
  if (mode === "admin" && canViewAdminApplications) return "admin"
  if (mode === "pm" && canViewPmApplications) return "pm"
  if (mode === "others" && canViewOwnApplications) return "others"
  if (canViewAdminApplications) return "admin"
  if (canViewPmApplications) return "pm"
  if (canViewOwnApplications) return "others"
  return "none"
}
