import { useNavigate, useRouterState } from "@tanstack/react-router"
import { useEffect, useRef, useState } from "react"

import { SIDEBAR_ITEMS } from "@/shared/config/navigation"
import { resolveNavigationFromPathname } from "@/shared/config/navigationResolve"
import { cn } from "@/shared/lib/utils"
import { useViewModeStore } from "@/shared/view-mode"

import { SideBarMenu } from "./menu/SideBarMenu"
import { SideBarMenuItem } from "./menu/SideBarMenuItem"
import { SideBarViewSwitcher } from "./SideBarViewSwitcher"
import { useVisibleSidebarSections } from "./useVisibleSidebarSections"

interface SideBarProps {
  className?: string
  activePathname?: string
}

export default function SideBar({ className, activePathname }: SideBarProps) {
  const currentPathname = useRouterState({ select: (s) => s.location.pathname })
  const pathname = activePathname ?? currentPathname
  const { visibleSections, isLoading } = useVisibleSidebarSections()
  const navigate = useNavigate()
  const mode = useViewModeStore((s) => s.mode)
  const prevModeRef = useRef(mode)

  const [manualOpenSectionId, setManualOpenSectionId] = useState<string>(() => {
    const active = resolveNavigationFromPathname(pathname, visibleSections)
    const initialSectionId =
      active?.section.id ?? visibleSections[0]?.id ?? SIDEBAR_ITEMS[0]?.id

    return initialSectionId ?? ""
  })
  const active = resolveNavigationFromPathname(pathname, visibleSections)
  const activeSectionId = active?.section.id

  useEffect(() => {
    const ids = new Set(visibleSections.map((section) => section.id))
    setManualOpenSectionId((prev) => {
      if (ids.has(prev)) return prev
      return activeSectionId ?? visibleSections[0]?.id ?? ""
    })
  }, [visibleSections, activeSectionId])

  useEffect(() => {
    if (prevModeRef.current === mode) return
    prevModeRef.current = mode
    if (activePathname || visibleSections.length === 0) return
    const active = resolveNavigationFromPathname(pathname, visibleSections)
    if (!active && visibleSections[0]?.menus[0]) {
      navigate({ to: visibleSections[0].menus[0].to })
    }
  }, [mode, visibleSections, pathname, navigate, activePathname])

  return (
    <nav
      aria-label="사이드 메뉴"
      className={cn(
        "border-teal-gray-200 bp2:flex hidden w-55 shrink-0 flex-col items-center justify-start border-r pt-4",
        className,
      )}
    >
      <SideBarViewSwitcher />
      {!isLoading && (
        <div className="flex flex-col py-4">
          <span className="text-body-3-regular text-teal-gray-400 mb-2 pl-0.5">
            10th Demo Day
          </span>
          {visibleSections.map(({ id, title, icon, menus }) => (
            <SideBarMenu
              key={id}
              id={id}
              title={title}
              icon={icon}
              isActive={activeSectionId === id}
              isOpen={activeSectionId === id || manualOpenSectionId === id}
              onToggle={() => {
                if (activeSectionId === id) return
                setManualOpenSectionId((prev) => (prev === id ? "" : id))
              }}
            >
              {menus.map((menu) => (
                <SideBarMenuItem
                  key={menu.id}
                  title={menu.title}
                  to={menu.to}
                  activePathname={activePathname}
                />
              ))}
            </SideBarMenu>
          ))}
        </div>
      )}
    </nav>
  )
}
