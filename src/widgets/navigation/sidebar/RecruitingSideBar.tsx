import { Link, useRouterState } from "@tanstack/react-router"
import { useState } from "react"

import {
  RECRUITING_GISU_LABEL,
  RECRUITING_SIDEBAR_ITEMS,
  resolveRecruitingSectionId,
} from "@/shared/config/recruitingNavigation"
import { cn } from "@/shared/lib/utils"

import { SideBarMenu } from "./menu/SideBarMenu"
import { SideBarMenuItem } from "./menu/SideBarMenuItem"

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

  const [manualOpenSectionId, setManualOpenSectionId] = useState<string>(
    () => activeSectionId ?? RECRUITING_SIDEBAR_ITEMS[0]?.id ?? "",
  )

  return (
    <nav
      aria-label="리크루팅 사이드 메뉴"
      className={cn(
        "border-teal-gray-200 flex w-55 shrink-0 flex-col items-center justify-start border-r pt-4",
        className,
      )}
    >
      <div className="flex flex-col py-4">
        <span className="text-body-3-regular text-teal-gray-400 mb-2 pl-0.5">
          {RECRUITING_GISU_LABEL}
        </span>
        {RECRUITING_SIDEBAR_ITEMS.map(({ id, title, icon: Icon, to, menus }) =>
          menus.length === 0 && to ? (
            <Link key={id} to={to} className="flex h-12 w-42 items-center">
              <span
                className={cn(
                  "hover:bg-teal-gray-100 flex h-12 w-39 items-center gap-2 rounded-[12px] pl-3 transition-all duration-200 ease-in-out",
                  activeSectionId === id &&
                    "shadow-inner-primary-1 bg-teal-100 hover:bg-teal-100",
                )}
              >
                <Icon
                  aria-hidden="true"
                  className={cn(
                    "h-5 w-5",
                    activeSectionId === id
                      ? "text-teal-600"
                      : "text-teal-gray-400",
                  )}
                />
                <span
                  className={cn(
                    "text-subtitle-3-semibold",
                    activeSectionId === id
                      ? "text-teal-600"
                      : "text-teal-gray-600",
                  )}
                >
                  {title}
                </span>
              </span>
            </Link>
          ) : (
            <SideBarMenu
              key={id}
              id={id}
              title={title}
              icon={Icon}
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
      </div>
    </nav>
  )
}
