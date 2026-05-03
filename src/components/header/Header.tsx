import { Link, useLocation } from "@tanstack/react-router"

import UmcLogo from "@/shared/assets/icon/logo/UmcLogo"
import Profile from "@/shared/ui/Profile"

import HeaderButton from "./HeaderButton"
import NavigationButton from "./NavigationButton"

interface NavItem {
  label: string
  to: string
  disabled?: boolean
}

const NAV_ITEMS: NavItem[] = [
  { label: "소개", to: "/intro", disabled: true },
  { label: "모집 안내", to: "/recruit", disabled: true },
  { label: "데모데이 매칭", to: "/matching" },
  { label: "프로젝트", to: "/projects", disabled: true },
  { label: "블로그", to: "/blog", disabled: true },
]

// TODO: 인증 시스템 구현 후 admin 분기 추가
// const ADMIN_NAV_ITEMS: NavItem[] = [
//   ...NAV_ITEMS,
//   { label: "관리자 페이지", to: "/admin" },
// ]

export default function Header() {
  const location = useLocation()

  return (
    <header className="bg-teal-gray-50 shadow-drop-neutral-3 flex h-20 w-full items-center justify-between overflow-clip">
      <Link to="/" className="flex w-55 items-center pl-10">
        <UmcLogo className="text-teal-gray-700 h-5.5 w-17.5" />
      </Link>

      <nav
        className="border-teal-gray-100 flex items-center gap-1.5 rounded-full border p-1.5"
        style={{ filter: "drop-shadow(0 0 8px rgba(10,86,80,0.04))" }}
      >
        {NAV_ITEMS.map((item) => (
          <NavigationButton
            key={item.to}
            label={item.label}
            to={item.to}
            selected={location.pathname.startsWith(item.to)}
            disabled={item.disabled}
          />
        ))}
      </nav>

      <div className="flex w-55 items-center justify-end gap-4 pr-8.5">
        <HeaderButton label="문의사항" type="trailing-icon" />
        <Profile />
      </div>
    </header>
  )
}
