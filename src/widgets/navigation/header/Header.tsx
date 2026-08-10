import { Link, useLocation } from "@tanstack/react-router"

import UmcLogo from "@/shared/assets/icon/logo/UmcLogo"
import {
  getDisabledNavMessage,
  HEADER_NAV_ITEMS,
  type HeaderNavItem,
  isHeaderNavItemActive,
} from "@/shared/config/headerNavPolicy"
import { useToastStore } from "@/shared/ui/toast/useToastStore"
import Profile from "@/widgets/navigation/header/Profile"

import HeaderButton from "./HeaderButton"
import NavigationButton from "./NavigationButton"

interface HeaderProps {
  activePathname?: string
}

export default function Header({ activePathname }: HeaderProps = {}) {
  const location = useLocation()
  const pathname = activePathname ?? location.pathname
  const addToast = useToastStore((s) => s.addToast)

  const handleDisabledClick = (item: HeaderNavItem) => {
    addToast({
      message: getDisabledNavMessage(item),
      color: "primary",
      variant: "deep",
      type: "notice",
      duration: 3000,
    })
  }

  return (
    <header className="bg-teal-gray-50 shadow-drop-neutral-3 relative z-50 flex h-20 min-h-20 w-full items-center justify-between overflow-visible">
      <div className="flex h-20 w-full items-center justify-between">
        <Link to="/" className="flex w-55 items-center pl-10">
          <UmcLogo className="text-teal-gray-700 h-5.5 w-17.5" />
        </Link>

        <nav className="bg-teal-gray-50 border-teal-gray-100 flex shrink-0 items-center gap-1.5 rounded-full border p-1.5 drop-shadow-[0_0_8px_rgba(10,86,80,0.04)]">
          {HEADER_NAV_ITEMS.map((item) => (
            <NavigationButton
              key={item.to}
              label={item.label}
              to={item.to}
              selected={isHeaderNavItemActive(pathname, item)}
              disabled={item.disabled}
              onClick={
                item.disabled ? () => handleDisabledClick(item) : undefined
              }
              className="min-w-18 px-4.5"
            />
          ))}
        </nav>

        <div className="flex w-40 items-center justify-end gap-4 pr-8.5">
          <HeaderButton label="문의사항" type="trailing-icon" />
          <Profile />
        </div>
      </div>
    </header>
  )
}
