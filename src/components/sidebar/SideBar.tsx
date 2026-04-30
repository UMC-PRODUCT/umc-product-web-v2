import { useEffect, useMemo, useState } from "react"

import { SIDEBAR_ITEMS } from "@/shared/config/navigation"
import { cn } from "@/shared/lib/utils"
import { indexFromMode, useViewModeStore } from "@/shared/view-mode"

import { SideBarDropDown } from "./dropdown/SideBarDropDown"
import { SideBarMenu } from "./menu/SideBarMenu"
import { SideBarMenuItem } from "./menu/SideBarMenuItem"
import { getVisibleSectionsByViewMode } from "./utils"

interface SideBarProps {
  className?: string
}

const DEMO_DAY_EDITION = 10

export default function SideBar({ className }: SideBarProps) {
  const mode = useViewModeStore((s) => s.mode)
  const setModeByIndex = useViewModeStore((s) => s.setModeByIndex)

  const visibleSections = useMemo(
    () => getVisibleSectionsByViewMode(SIDEBAR_ITEMS, mode),
    [mode],
  )
  const [openSectionId, setOpenSectionId] = useState<string>(
    visibleSections[0]?.id ?? SIDEBAR_ITEMS[0]?.id ?? "",
  )

  useEffect(() => {
    const ids = new Set(visibleSections.map((section) => section.id))
    if (!ids.has(openSectionId)) {
      setOpenSectionId(visibleSections[0]?.id ?? "")
    }
  }, [openSectionId, visibleSections])

  return (
    <nav
      aria-label="사이드 메뉴"
      className={cn(
        "border-teal-gray-200 flex w-55 shrink-0 flex-col items-center justify-start border-r pt-4",
        className,
      )}
    >
      <SideBarDropDown
        selectedIdx={indexFromMode(mode)}
        onSelect={setModeByIndex}
      />
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
            onToggle={() => setOpenSectionId((prev) => (prev === id ? "" : id))}
          >
            {menus.map((menu) => (
              <SideBarMenuItem key={menu.id} title={menu.title} to={menu.to} />
            ))}
          </SideBarMenu>
        ))}
      </div>
    </nav>
  )
}
