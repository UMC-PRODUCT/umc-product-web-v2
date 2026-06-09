import { useEffect, useMemo, useState } from "react"

import { useMe } from "@/features/auth/hooks/useMe"
import {
  canAccessProjectSettings,
  canManageProjects,
  isCurrentTermPm,
  isOperator,
} from "@/features/auth/model/identity"
import { SIDEBAR_ITEMS } from "@/shared/config/navigation"
import { cn } from "@/shared/lib/utils"

import { SideBarMenu } from "./menu/SideBarMenu"
import { SideBarMenuItem } from "./menu/SideBarMenuItem"
import { filterSectionsByPermission } from "./utils"

interface SideBarProps {
  className?: string
}

const DEMO_DAY_EDITION = 10

export default function SideBar({ className }: SideBarProps) {
  const { data: me, isLoading: isMeLoading } = useMe()
  const canAccessSettings = canAccessProjectSettings(me)
  const canManage = canManageProjects(me)
  const canRecruit = isOperator(me) || isCurrentTermPm(me)

  const visibleSections = useMemo(
    () =>
      filterSectionsByPermission(SIDEBAR_ITEMS, {
        canAccessProjectSettings: canAccessSettings,
        canManageProjects: canManage,
        canManageRecruitment: canRecruit,
      }),
    [canAccessSettings, canManage, canRecruit],
  )

  const [openSectionId, setOpenSectionId] = useState<string>(
    visibleSections[0]?.id ?? SIDEBAR_ITEMS[0]?.id ?? "",
  )

  useEffect(() => {
    const ids = new Set(visibleSections.map((section) => section.id))
    setOpenSectionId((prev) =>
      ids.has(prev) ? prev : (visibleSections[0]?.id ?? ""),
    )
  }, [visibleSections])

  const isLoading = isMeLoading

  return (
    <nav
      aria-label="사이드 메뉴"
      className={cn(
        "border-teal-gray-200 flex w-55 shrink-0 flex-col items-center justify-start border-r pt-4",
        className,
      )}
    >
      {!isLoading && (
        <div className="flex flex-col py-4">
          <span className="text-body-3-regular text-teal-gray-400 mb-2 pl-0.5">
            {DEMO_DAY_EDITION}th Demoday
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
                />
              ))}
            </SideBarMenu>
          ))}
        </div>
      )}
    </nav>
  )
}
