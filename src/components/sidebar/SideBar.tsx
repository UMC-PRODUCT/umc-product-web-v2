import { useRouterState } from "@tanstack/react-router"
import { useEffect, useState } from "react"

import { SIDEBAR_ITEMS } from "@/shared/config/navigation"
import { resolveNavigationFromPathname } from "@/shared/config/navigationResolve"
import { cn } from "@/shared/lib/utils"

import { SideBarMenu } from "./menu/SideBarMenu"
import { SideBarMenuItem } from "./menu/SideBarMenuItem"
import { useVisibleSidebarSections } from "./useVisibleSidebarSections"

interface SideBarProps {
  className?: string
  activePathname?: string
}

export default function SideBar({ className, activePathname }: SideBarProps) {
  const currentPathname = useRouterState({ select: (s) => s.location.pathname })
  const pathname = activePathname ?? currentPathname
  const { visibleSections, isLoading } = useVisibleSidebarSections()

  // 현재 경로에 해당하는 섹션을 초기값으로 사용
  const [openSectionId, setOpenSectionId] = useState<string>(() => {
    const active = resolveNavigationFromPathname(pathname, visibleSections)
    return (
      active?.section.id ?? visibleSections[0]?.id ?? SIDEBAR_ITEMS[0]?.id ?? ""
    )
  })

  useEffect(() => {
    const ids = new Set(visibleSections.map((section) => section.id))
    setOpenSectionId((prev) =>
      ids.has(prev) ? prev : (visibleSections[0]?.id ?? ""),
    )
  }, [visibleSections])

  return (
    <nav
      aria-label="사이드 메뉴"
      className={cn(
        "border-teal-gray-200 hidden w-55 shrink-0 flex-col items-center justify-start border-r pt-4 min-[960px]:flex",
        className,
      )}
    >
      {!isLoading && (
        <div className="flex flex-col py-4">
          <span className="text-body-3-regular text-teal-gray-400 mb-2 pl-0.5">
            Demo Day
          </span>
          {visibleSections.map(({ id, title, icon, menus }) => (
            <SideBarMenu
              key={id}
              id={id}
              title={title}
              icon={icon}
              isOpen={openSectionId === id}
              onToggle={() =>
                setOpenSectionId((prev) => (prev === id ? "" : id))
              }
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
