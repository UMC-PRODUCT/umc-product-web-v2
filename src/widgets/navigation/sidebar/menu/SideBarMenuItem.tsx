import { Link, useMatchRoute } from "@tanstack/react-router"

import { cn } from "@/shared/lib/utils"

interface SideBarMenuItemProps {
  title: string
  to: string
  indicator?: React.ReactNode
  activePathname?: string
}

export function SideBarMenuItem({
  title,
  to,
  indicator,
  activePathname,
}: SideBarMenuItemProps) {
  const matchRoute = useMatchRoute()
  const isActive = activePathname
    ? activePathname === to || activePathname.startsWith(`${to}/`)
    : !!matchRoute({ to })

  return (
    <Link
      to={to}
      className={cn(
        "flex h-9 w-full items-center gap-2.75 rounded-[12px] px-5",
        isActive
          ? "text-subtitle-4-semibold text-teal-700"
          : "text-body-2-medium text-teal-gray-600 hover:bg-teal-gray-50",
      )}
    >
      {indicator ?? <span aria-hidden="true">-</span>}
      <span>{title}</span>
    </Link>
  )
}
