export type NavItem = {
  label: string
  to: string
  disabled?: boolean
  activeBasePath?: string
  activeBasePaths?: string[]
  inactiveBasePaths?: string[]
}

function matchesBasePath(pathname: string, basePath: string): boolean {
  if (basePath === "/") return pathname === "/"
  return pathname === basePath || pathname.startsWith(basePath + "/")
}

export function isNavActive(pathname: string, item: NavItem): boolean {
  if (item.disabled) return false
  if (
    item.inactiveBasePaths?.some((basePath) =>
      matchesBasePath(pathname, basePath),
    )
  ) {
    return false
  }

  const activeBasePaths = item.activeBasePaths ?? [item.activeBasePath ?? item.to]
  return activeBasePaths.some((basePath) =>
    matchesBasePath(pathname, basePath),
  )
}

interface HeaderNavVisibility {
  isAuthed: boolean
  showRecruiting: boolean
  showSettings: boolean
  settingsEntryPath: string
  /** 모집 접수 중이면 데모데이 매칭을 감춘다. 두 시즌은 같이 돌지 않는다. */
  isRecruitingPeriod: boolean
}

export function buildRecruitingNavItems({
  isAuthed,
  showRecruiting,
  showSettings,
  settingsEntryPath,
  isRecruitingPeriod,
}: HeaderNavVisibility): NavItem[] {
  return [
    { label: "소개", to: "/intro" },
    {
      label: "모집 안내",
      to: "/projects/notice",
      activeBasePaths: ["/projects/notice", "/projects/apply"],
    },
    {
      label: "프로젝트",
      to: "/projects",
      inactiveBasePaths: ["/projects/notice", "/projects/apply"],
    },
    // 매칭은 로그인해야 들어갈 수 있다. 게스트에게 보이면 눌러도 로그인으로 튕긴다.
    // 모집 기간에는 감춘다. 데모데이와 리크루팅은 같이 돌지 않아서, 모집 중에
    // 매칭 탭을 열어 두면 지난 시즌 화면으로 보낸다.
    ...(isAuthed && !isRecruitingPeriod
      ? [
          {
            label: "데모데이 매칭",
            to: "/matching/projects",
            activeBasePath: "/matching",
          } satisfies NavItem,
        ]
      : []),
    ...(showRecruiting
      ? [
          {
            label: "리크루팅",
            // 탭 목적지는 대시보드지만 리크루팅 영역 어디서든 활성이어야 한다.
            to: "/recruiting/dashboard/applications",
            activeBasePath: "/recruiting",
          } satisfies NavItem,
        ]
      : []),
    ...(showSettings
      ? [
          {
            label: "설정",
            // 탭은 설정 영역 첫 화면으로 보내고, 활성 판정은 영역 전체로 본다.
            to: settingsEntryPath,
            activeBasePath: "/manage",
          } satisfies NavItem,
        ]
      : []),
  ]
}
