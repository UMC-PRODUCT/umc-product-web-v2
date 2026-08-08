export type HeaderNavItem = {
  label: string
  to: string
  activeBasePath?: string
  activeBasePaths?: string[]
  inactiveBasePaths?: string[]
  disabled?: boolean
  disabledMessage?: string
}

/**
 * 랜딩(소개) 헤더의 탭.
 *
 * 앱 안쪽 헤더와 목록이 다르다. 랜딩은 아직 로그인하지 않은 방문자가 먼저 닿는
 * 화면이라 공개된 곳만 연다. 권한이 있어야 들어가는 리크루팅·설정과 로그인이
 * 필요한 데모데이 매칭은 여기 두지 않는다. 눌러서 로그인이나 권한 없음으로
 * 튕기는 탭은 진입로가 아니라 막다른 길이다.
 *
 * 앱 안쪽 헤더는 권한과 모집 시점에 따라 탭이 늘어난다. `buildRecruitingNavItems`
 * 가 따로 만든다.
 */
export const HEADER_NAV_ITEMS: HeaderNavItem[] = [
  {
    label: "소개",
    to: "/intro",
  },
  {
    label: "모집 안내",
    to: "/projects/notice",
    // 지원 폼도 모집 안내에서 이어지는 화면이라 같은 탭이 켜져야 한다.
    activeBasePaths: ["/projects/notice", "/projects/apply"],
  },
  {
    label: "프로젝트",
    to: "/projects",
    // `/projects` 로 시작하는 모집 흐름까지 삼키면 두 탭이 같이 켜진다.
    inactiveBasePaths: ["/projects/notice", "/projects/apply"],
  },
]

export function getDisabledNavMessage(item: HeaderNavItem) {
  return (
    item.disabledMessage ??
    `${item.label} 서비스는 준비 중입니다. 더 나은 UMC 웹사이트로 찾아뵙겠습니다!`
  )
}

function matchesBasePath(pathname: string, basePath: string): boolean {
  if (basePath === "/") return pathname === "/"
  return pathname === basePath || pathname.startsWith(basePath + "/")
}

export function isHeaderNavItemActive(pathname: string, item: HeaderNavItem) {
  if (item.disabled) return false
  if (
    item.inactiveBasePaths?.some((basePath) =>
      matchesBasePath(pathname, basePath),
    )
  ) {
    return false
  }

  const activeBasePaths = item.activeBasePaths ?? [
    item.activeBasePath ?? item.to,
  ]
  return activeBasePaths.some((basePath) => matchesBasePath(pathname, basePath))
}
