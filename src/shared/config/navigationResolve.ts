import {
  type FlatNavItem,
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

/**
 * menu.to 와 matchPaths 중 path 에 일치하는 것들 가운데 가장 긴 경로를 반환.
 *
 * to 에서 멈추면 안 된다. 항목이 넓은 to 와 좁은 별칭을 함께 가질 때
 * (예: to `/manage` + 별칭 `/manage/school/detail`) 짧은 to 로 답해 버려,
 * 다른 항목의 `/manage/school` 에 최장 일치를 빼앗긴다.
 */
function getMatchedPath(path: string, menu: SideBarMenu): string | null {
  let longest: string | null = null
  for (const candidate of [menu.to, ...(menu.matchPaths ?? [])]) {
    if (!matchesPath(path, candidate)) continue
    if (candidate.length > (longest?.length ?? -1)) longest = candidate
  }
  return longest
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

/**
 * 평면 사이드바에서 현재 경로에 해당하는 항목 id.
 * 대분류가 없을 뿐 매칭 규칙(최장 일치 + matchPaths)은 위와 같아야 해서 같은 헬퍼를 쓴다.
 */
export function resolveFlatNavItemId(
  pathname: string,
  items: readonly FlatNavItem[],
): string | undefined {
  const path = normalizePathname(pathname)
  let bestLen = -1
  let pickedId: string | undefined

  for (const item of items) {
    const matchedPath = getMatchedPath(path, item)
    if (matchedPath === null) continue
    if (matchedPath.length > bestLen) {
      bestLen = matchedPath.length
      pickedId = item.id
    }
  }
  return pickedId
}

/** 탭 id(menu.id) → 이동 경로 */
export function pathForMenuId(menuId: string): string | undefined {
  return SIDEBAR_MENU_BY_ID.get(menuId)?.to
}
