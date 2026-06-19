import {
  SIDEBAR_ITEMS,
  SIDEBAR_MENU_BY_ID,
  type SideBarMenu,
  type SideBarSection,
} from "@/shared/config/navigation"

/** `/foo/` ↔ `/foo` 등 trailing slash 차이를 흡수 */
function normalizePathname(pathname: string): string {
  if (pathname.length > 1 && pathname.endsWith("/")) {
    return pathname.slice(0, -1)
  }
  return pathname
}

function matchesPath(path: string, target: string): boolean {
  return path === target || path.startsWith(`${target}/`)
}

/** menu.to 또는 matchPaths 중 path와 일치하는 경로 문자열을 반환 */
function getMatchedPath(path: string, menu: SideBarMenu): string | null {
  if (matchesPath(path, menu.to)) return menu.to
  for (const alias of menu.matchPaths ?? []) {
    if (matchesPath(path, alias)) return alias
  }
  return null
}

export function resolveNavigationFromPathname(pathname: string): {
  section: SideBarSection
  menu: SideBarMenu
} | null
export function resolveNavigationFromPathname(
  pathname: string,
  sections: readonly SideBarSection[],
): {
  section: SideBarSection
  menu: SideBarMenu
} | null
export function resolveNavigationFromPathname(
  pathname: string,
  sections?: readonly SideBarSection[],
): {
  section: SideBarSection
  menu: SideBarMenu
} | null {
  const path = normalizePathname(pathname)
  let bestLen = -1
  let picked: { section: SideBarSection; menu: SideBarMenu } | null = null

  const source = sections ?? SIDEBAR_ITEMS
  for (const section of source) {
    for (const menu of section.menus) {
      const matchedPath = getMatchedPath(path, menu)
      if (matchedPath === null) continue
      if (matchedPath.length > bestLen) {
        bestLen = matchedPath.length
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
