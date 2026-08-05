import { useNavigate, useRouterState } from "@tanstack/react-router"
import { useEffect, useRef, useState } from "react"

import { useViewModeStore } from "@/entities/member/view-mode"
import { SIDEBAR_ITEMS } from "@/shared/config/navigation"
import { resolveNavigationFromPathname } from "@/shared/config/navigationResolve"
import { useActiveGeneration } from "@/shared/hooks/useActiveGisu"
import { toDemoDayLabel } from "@/shared/lib/gisuLabel"

import { BaseSideBar } from "./BaseSideBar"
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
  const { data: generation } = useActiveGeneration()
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
    <BaseSideBar
      ariaLabel="사이드 메뉴"
      label={isLoading ? undefined : toDemoDayLabel(generation)}
      className={className}
      header={<SideBarViewSwitcher />}
    >
      {/* 권한 필터 결과가 오기 전에 그리면 메뉴가 나타났다 사라진다 */}
      {!isLoading &&
        visibleSections.map(({ id, title, icon, menus }) => (
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
    </BaseSideBar>
  )
}
