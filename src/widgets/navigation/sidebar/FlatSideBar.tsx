import { useRouterState } from "@tanstack/react-router"

import { resolveFlatNavItemId } from "@/shared/config/navigationResolve"

import { BaseSideBar } from "./BaseSideBar"
import { FlatSideBarItem } from "./FlatSideBarItem"

import type { FlatNavItem } from "@/shared/config/navigation"

interface FlatSideBarProps {
  ariaLabel: string
  label?: string
  items: readonly FlatNavItem[]
  className?: string
  activePathname?: string
}

export function FlatSideBar({
  ariaLabel,
  label,
  items,
  className,
  activePathname,
}: FlatSideBarProps) {
  const currentPathname = useRouterState({ select: (s) => s.location.pathname })
  const pathname = activePathname ?? currentPathname
  const activeItemId = resolveFlatNavItemId(pathname, items)

  return (
    <BaseSideBar ariaLabel={ariaLabel} label={label} className={className}>
      {items.map((item) => (
        <FlatSideBarItem
          key={item.id}
          title={item.title}
          to={item.to}
          icon={item.icon}
          isActive={activeItemId === item.id}
          disabled={item.disabled}
        />
      ))}
    </BaseSideBar>
  )
}
