import { useRouterState } from "@tanstack/react-router"
import { useState } from "react"

import { resolveRecruitingSectionId } from "@/shared/config/recruitingNavigation"
import { useActiveGeneration } from "@/shared/hooks/useActiveGisu"
import { toUmcGisuLabel } from "@/shared/lib/gisuLabel"

import { BaseSideBar } from "./BaseSideBar"
import { FlatSideBarItem } from "./FlatSideBarItem"
import { SideBarMenu } from "./menu/SideBarMenu"
import { SideBarMenuItem } from "./menu/SideBarMenuItem"
import { useVisibleRecruitingSections } from "./useVisibleRecruitingSections"

interface RecruitingSideBarProps {
  className?: string
  activePathname?: string
}

export default function RecruitingSideBar({
  className,
  activePathname,
}: RecruitingSideBarProps) {
  const currentPathname = useRouterState({ select: (s) => s.location.pathname })
  const pathname = activePathname ?? currentPathname
  const activeSectionId = resolveRecruitingSectionId(pathname)

  const visibleSections = useVisibleRecruitingSections()

  const [manualOpenSectionId, setManualOpenSectionId] = useState<string>(() =>
    activeSectionId ? "" : (visibleSections[0]?.id ?? ""),
  )
  const { data: generation } = useActiveGeneration()

  return (
    <BaseSideBar
      ariaLabel="리크루팅 사이드 메뉴"
      label={toUmcGisuLabel(generation)}
      className={className}
    >
      {visibleSections.map(({ id, title, icon, to, menus }) =>
        menus.length === 0 && to ? (
          <FlatSideBarItem
            key={id}
            title={title}
            to={to}
            icon={icon}
            isActive={activeSectionId === id}
          />
        ) : (
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
        ),
      )}
    </BaseSideBar>
  )
}
