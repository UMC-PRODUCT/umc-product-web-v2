import {
  SIDEBAR_ITEMS,
  SIDEBAR_MENU_BY_ID,
  type SideBarMenu,
  type SideBarSection,
} from "@/shared/config/navigation"

export function resolveNavigationFromPathname(pathname: string): {
  section: SideBarSection
  menu: SideBarMenu
} | null {
  let bestLen = -1
  let picked: { section: SideBarSection; menu: SideBarMenu } | null = null

  for (const section of SIDEBAR_ITEMS) {
    for (const menu of section.menus) {
      const hit = pathname === menu.to || pathname.startsWith(`${menu.to}/`)
      if (!hit) continue
      if (menu.to.length > bestLen) {
        bestLen = menu.to.length
        picked = { section, menu }
      }
    }
  }
  return picked
}

/** 탭 id(menu.id) → 이동 경로 */
export function pathForMenuId(menuId: string): string | undefined {
  return SIDEBAR_MENU_BY_ID.get(menuId)?.to
}
