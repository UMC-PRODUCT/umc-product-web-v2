import type { ViewMode } from "@/shared/view-mode"

export type ProjectDetailCtaMode =
  | "recruit-questions"
  | "my-application"
  | "apply"
  | "plan-only"

export function resolveProjectDetailCtaMode(
  mode: ViewMode,
  isSameBranch: boolean,
  isApplied: boolean,
): ProjectDetailCtaMode {
  if (mode === "admin") return "recruit-questions"
  if (!isSameBranch) return "plan-only"
  if (mode === "pm") return "recruit-questions"
  return isApplied ? "my-application" : "apply"
}
