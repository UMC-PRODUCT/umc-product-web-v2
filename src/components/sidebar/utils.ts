import { SIDEBAR_ID, type SideBarSection } from "@/shared/config/navigation"

export function filterSectionsByPermission(
  sections: readonly SideBarSection[],
  canManageRecruitment: boolean,
): SideBarSection[] {
  if (canManageRecruitment) return [...sections]

  return sections
    .filter((section) => section.id !== SIDEBAR_ID.section.projectSettings)
    .map((section) => {
      if (section.id !== SIDEBAR_ID.section.teamMatching) return section
      return {
        ...section,
        menus: section.menus.filter(
          (menu) => menu.id !== SIDEBAR_ID.item.matchingRounds,
        ),
      }
    })
}
