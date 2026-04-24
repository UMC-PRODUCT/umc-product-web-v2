/** 뷰 모드 관리 파일:
 * admin, plan, others 3가지 뷰 모드 관리
 */
import { create } from "zustand"

import { SIDEBAR_ID, type SideBarSection } from "@/shared/config/navigation"

export type ProjectDetailCtaMode =
  | "read-only-recruit-questions"
  | "apply-enabled"
  | "apply-hidden"

export const VIEW_MODE_OPTIONS = [
  { mode: "admin", label: "Admin View" },
  { mode: "challenger-plan", label: "Challenger-Plan View" },
  { mode: "challenger-others", label: "Challenger-Others View" },
] as const

export type ViewMode = (typeof VIEW_MODE_OPTIONS)[number]["mode"]

interface ViewModeState {
  mode: ViewMode
  viewerBranch: string
  setModeByIndex: (index: number) => void
}

function modeFromIndex(index: number): ViewMode {
  return VIEW_MODE_OPTIONS[index]?.mode ?? "admin"
}

export function indexFromMode(mode: ViewMode): number {
  const idx = VIEW_MODE_OPTIONS.findIndex((item) => item.mode === mode)
  return idx === -1 ? 0 : idx
}

/** 임시 상태 */
export const useViewModeStore = create<ViewModeState>((set) => ({
  mode: "admin",
  viewerBranch: "Selenium",
  setModeByIndex: (index) => set({ mode: modeFromIndex(index) }),
}))

export function getVisibleSectionsByViewMode(
  sections: readonly SideBarSection[],
  mode: ViewMode,
): SideBarSection[] {
  if (mode === "admin") return [...sections]

  return sections.map((section) => {
    if (section.id !== SIDEBAR_ID.section.teamMatching) return section
    return {
      ...section,
      menus: section.menus.filter(
        (menu) => menu.id !== SIDEBAR_ID.item.matchingRounds,
      ),
    }
  })
}

export function resolveProjectDetailCtaMode(
  mode: ViewMode,
  viewerBranch: string,
  projectBranch: string,
): ProjectDetailCtaMode {
  if (mode === "admin" || mode === "challenger-plan") {
    return "read-only-recruit-questions"
  }
  return viewerBranch === projectBranch ? "apply-enabled" : "apply-hidden"
}
