import { Link, useLocation } from "@tanstack/react-router"

import DownChevronIcon from "@/shared/assets/icon/chevron/SideBar/DownChevronIcon"
import UmcLogo from "@/shared/assets/icon/logo/UmcLogo"
import ProfileIcon from "@/shared/assets/icon/people/ProfileIcon"
import { cn } from "@/shared/lib/utils"

interface NavItem {
  label: string
  to: string
}

const NAV_ITEMS: NavItem[] = [
  { label: "데모데이 매칭", to: "/matching" },
  { label: "관리자 페이지", to: "/admin" },
]

export default function Header() {
  const location = useLocation()

  return (
    <header className="bg-teal-gray-100 border-teal-gray-200 flex h-18 w-full items-center border-b">
      <Link to="/" className="flex items-center pl-10">
        <UmcLogo className="text-teal-gray-700 h-5.5 w-17.5" />
      </Link>

      <nav className="ml-20 flex items-center gap-12">
        {NAV_ITEMS.map((item) => {
          const isActive = location.pathname.startsWith(item.to)
          return (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "whitespace-nowrap",
                isActive
                  ? "text-heading-7-semibold text-teal-500"
                  : "text-subtitle-2-medium text-teal-gray-600",
              )}
            >
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="ml-auto flex items-center gap-12 pr-7">
        <button className="flex items-center gap-0.5" type="button">
          <span className="text-body-1-medium text-teal-gray-600">
            문의사항
          </span>
          <DownChevronIcon className="size-5" />
        </button>
        <ProfileIcon className="size-10" />
      </div>
    </header>
  )
}
