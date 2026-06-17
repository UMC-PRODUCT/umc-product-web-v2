export const RECRUITING_DISABLED_MESSAGE =
  "리크루팅 서비스는 11기 모집 때 공개됩니다. 많은 관심 부탁드립니다!"

export type HeaderNavItem = {
  label: string
  to: string
  activeBasePath?: string
  disabled?: boolean
  disabledMessage?: string
}

export const HEADER_NAV_ITEMS: HeaderNavItem[] = [
  {
    label: "소개",
    to: "/intro",
    disabled: true,
    disabledMessage:
      "소개 페이지는 준비 중입니다. 더 나은 UMC 웹사이트로 찾아뵙겠습니다!",
  },
  {
    label: "데모데이 매칭",
    to: "/matching/projects",
    activeBasePath: "/matching",
  },
  {
    label: "리크루팅",
    to: "/recruiting",
    disabled: true,
    disabledMessage: RECRUITING_DISABLED_MESSAGE,
  },
]

export function getDisabledNavMessage(item: HeaderNavItem) {
  return (
    item.disabledMessage ??
    `${item.label} 서비스는 준비 중입니다. 더 나은 UMC 웹사이트로 찾아뵙겠습니다!`
  )
}

export function isHeaderNavItemActive(pathname: string, item: HeaderNavItem) {
  const basePath = item.activeBasePath ?? item.to

  return pathname === basePath || pathname.startsWith(basePath + "/")
}
