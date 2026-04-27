import { SIDEBAR_ID, type SideBarSection } from "@/shared/config/navigation"

import type { ViewMode } from "@/shared/view-mode"

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
