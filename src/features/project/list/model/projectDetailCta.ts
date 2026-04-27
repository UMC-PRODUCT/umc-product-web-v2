import type { ViewMode } from "@/shared/view-mode"

export type ProjectDetailCtaMode =
  | "recruit-questions" // 모집 문항 보기 (admin 실제 뷰, plan 같은 지부, admin 드롭다운 프리뷰 전체)
  | "my-application" // 내 지원서 확인하기 (others 같은 지부 + 지원함)
  | "apply" // 지원하기 (others 같은 지부 + 미지원)
  | "plan-only" // 기획 보기만 (다른 지부)

/**
 * @param isSameBranch - admin 드롭다운 프리뷰 컨텍스트에서는 항상 true로 전달해
 *   실제 지부 비교 없이 "같은 지부인 것처럼" 동작하게 함
 */
export function resolveProjectDetailCtaMode(
  mode: ViewMode,
  isSameBranch: boolean,
  isApplied: boolean,
): ProjectDetailCtaMode {
  if (mode === "admin") return "recruit-questions"
  if (!isSameBranch) return "plan-only"
  if (mode === "challenger-plan") return "recruit-questions"
  return isApplied ? "my-application" : "apply"
}
