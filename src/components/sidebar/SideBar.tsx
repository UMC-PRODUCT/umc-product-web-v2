import { useEffect, useMemo, useState } from "react"

import { useMe } from "@/features/auth/hooks/useMe"
import { rolesToViewModes } from "@/features/auth/model/mappers"
import { SIDEBAR_ITEMS } from "@/shared/config/navigation"
import { cn } from "@/shared/lib/utils"
import {
  useViewModeStore,
  VIEW_MODE_OPTIONS,
  type ViewMode,
} from "@/shared/view-mode"

import { SideBarDropDown } from "./dropdown/SideBarDropDown"
import { SideBarMenu } from "./menu/SideBarMenu"
import { SideBarMenuItem } from "./menu/SideBarMenuItem"
import { getVisibleSectionsByViewMode } from "./utils"

interface SideBarProps {
  className?: string
}

const DEMO_DAY_EDITION = 10

function resolveActiveMode(
  mode: ViewMode,
  availableModes: ViewMode[],
): ViewMode {
  if (availableModes.length === 0) return mode
  return availableModes.includes(mode) ? mode : availableModes[0]!
}

export default function SideBar({ className }: SideBarProps) {
  const mode = useViewModeStore((s) => s.mode)
  const setMode = useViewModeStore((s) => s.setMode)

  const { data: me, isLoading: isMeLoading } = useMe()

  const availableModes = useMemo(() => rolesToViewModes(me?.roles), [me?.roles])

  const availableOptions = useMemo(
    () => VIEW_MODE_OPTIONS.filter((opt) => availableModes.includes(opt.mode)),
    [availableModes],
  )

  const activeMode = resolveActiveMode(mode, availableModes)

  useEffect(() => {
    if (activeMode !== mode) setMode(activeMode)
  }, [activeMode, mode, setMode])

  const visibleSections = useMemo(
    () => getVisibleSectionsByViewMode(SIDEBAR_ITEMS, activeMode),
    [activeMode],
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

  const selectedDropdownIdx = availableOptions.findIndex(
    (opt) => opt.mode === activeMode,
  )

  return (
    <nav
      aria-label="사이드 메뉴"
      className={cn(
        "border-teal-gray-200 flex w-55 shrink-0 flex-col items-center justify-start border-r pt-4",
        className,
      )}
    >
      {availableOptions.length >= 2 && (
        <SideBarDropDown
          options={availableOptions}
          selectedIdx={selectedDropdownIdx}
          onSelect={(idx) => {
            const selected = availableOptions[idx]
            if (selected) setMode(selected.mode)
          }}
        />
      )}
      {!isMeLoading && (
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
