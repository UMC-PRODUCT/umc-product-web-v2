export type NavItem = {
  label: string
  to: string
  disabled?: boolean
  /** to 말고 이 경로로 활성 여부를 본다. 탭 목적지와 영역 루트가 다를 때 쓴다. */
  activeBasePath?: string
}

export function isNavActive(pathname: string, item: NavItem): boolean {
  // 비활성 탭은 목적지가 자리표시자(`/`)라서, 활성 판정에 넣으면 루트에서 켜진다.
  if (item.disabled) return false

  const base = item.activeBasePath ?? item.to
  if (base === "/") return pathname === "/"
  return pathname === base || pathname.startsWith(base + "/")
}

interface HeaderNavVisibility {
  isAuthed: boolean
  showRecruiting: boolean
  showSettings: boolean
  settingsEntryPath: string
}

export function buildRecruitingNavItems({
  isAuthed,
  showRecruiting,
  showSettings,
  settingsEntryPath,
}: HeaderNavVisibility): NavItem[] {
  return [
    { label: "소개", to: "/intro" },
    // TODO(#710): 모집 안내 랜딩 라우트 확정 전까지 비활성(홈으로 오연결 방지)
    { label: "모집 안내", to: "/", disabled: true },
    { label: "프로젝트", to: "/projects" },
    // 매칭은 로그인해야 들어갈 수 있다. 게스트에게 보이면 눌러도 로그인으로 튕긴다.
    ...(isAuthed
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
