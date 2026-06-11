import { Link, useLocation } from "@tanstack/react-router"
import { useMemo } from "react"

import { useMe } from "@/features/auth/hooks/useMe"
import { isOperator, isSchoolStaff } from "@/features/auth/model/identity"
import UmcLogo from "@/shared/assets/icon/logo/UmcLogo"
import Profile from "@/shared/ui/Profile"

import NavigationButton from "./NavigationButton"

interface NavItem {
  label: string
  to: string
  disabled?: boolean
}

const BASE_NAV: NavItem[] = [
  { label: "소개", to: "/intro", disabled: true },
  { label: "모집 안내", to: "/recruit", disabled: true },
  { label: "프로젝트", to: "/projects", disabled: true },
  { label: "데모데이 매칭", to: "/matching" },
]

const MANAGE_NAV: NavItem = {
  label: "리크루팅",
  to: "recruiting",
  disabled: true,
}

const SYSTEM_NAV: NavItem = {
  label: "시스템 관리",
  to: "/system",
  disabled: true,
}

export default function Header() {
  const location = useLocation()
  const { data: me } = useMe()

  const navItems = useMemo(() => {
    if (isOperator(me)) return [...BASE_NAV, MANAGE_NAV, SYSTEM_NAV]
    if (isSchoolStaff(me)) return [...BASE_NAV, MANAGE_NAV]
    return BASE_NAV
  }, [me])

  return (
    <header className="bg-teal-gray-50 shadow-drop-neutral-3 flex h-20 w-full items-center justify-between overflow-visible">
      <Link to="/" className="flex w-55 items-center pl-10">
        <UmcLogo className="text-teal-gray-700 h-5.5 w-17.5" />
      </Link>

      <nav className="bg-teal-gray-50 border-teal-gray-100 flex items-center gap-1.5 rounded-full border p-1.5 drop-shadow-[0_0_8px_rgba(10,86,80,0.04)]">
        {navItems.map((item) => (
          <NavigationButton
            key={item.to}
            label={item.label}
            to={item.to}
            selected={location.pathname.startsWith(item.to)}
            disabled={item.disabled}
          />
        ))}
      </nav>

      <div className="flex w-55 items-center justify-end pr-8.5">
        <Profile />
      </div>
    </header>
  )
}
