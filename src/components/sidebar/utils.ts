import { SIDEBAR_ID, type SideBarSection } from "@/shared/config/navigation"

export interface SidebarPermissions {
  canAccessProjectSettings: boolean
  canManageProjects: boolean
  canManageMatchingRounds: boolean
  isRegularChallenger?: boolean
}

export function filterSectionsByPermission(
  sections: readonly SideBarSection[],
  {
    canAccessProjectSettings,
    canManageProjects,
    canManageMatchingRounds,
    isRegularChallenger = false,
  }: SidebarPermissions,
): SideBarSection[] {
  return sections
    .filter((section) =>
      section.id === SIDEBAR_ID.section.projectSettings
        ? canAccessProjectSettings
        : true,
    )
    .map((section) => {
      if (section.id === SIDEBAR_ID.section.projectSettings) {
        return {
          ...section,
          menus: section.menus.filter((menu) =>
            menu.id === SIDEBAR_ID.item.projectRegister ||
            menu.id === SIDEBAR_ID.item.projectManagement
              ? canManageProjects
              : true,
          ),
        }
      }
      if (section.id === SIDEBAR_ID.section.teamMatching) {
        return {
          ...section,
          menus: section.menus
            .filter((menu) => {
              if (menu.id === SIDEBAR_ID.item.matchingRounds)
                return canManageMatchingRounds
              return true
            })
            .map((menu) => {
              if (
                menu.id === SIDEBAR_ID.item.matchingApplications &&
                isRegularChallenger
              ) {
                return { ...menu, title: "내 지원 현황" }
              }
              return menu
            }),
        }
      }
      return section
    })
}
