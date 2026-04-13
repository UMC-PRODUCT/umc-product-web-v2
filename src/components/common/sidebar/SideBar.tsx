import { useState } from "react"

import { cn } from "@/lib/utils"

import { SideBarDropDown } from "./dropdown/SideBarDropDown"
import { SideBarItem } from "./menu/SideBarItem"
import { SideBarMenuItem } from "./menu/SideBarMenuItem"
import { SIDEBAR_ITEMS } from "./sidebar.config"

interface SideBarProps {
  className?: string
}

const DEMO_DAY_EDITION = 10

export default function SideBar({ className }: SideBarProps) {
  const [openTitle, setOpenTitle] = useState<string>(
    SIDEBAR_ITEMS[0]?.title ?? "",
  )

  return (
    <nav
      aria-label="사이드 메뉴"
      className={cn(
        "border-teal-gray-200 flex h-fit w-55 shrink-0 flex-col items-center justify-start border-r pt-4",
        className,
      )}
    >
      <SideBarDropDown />
      <div className="flex flex-col py-4">
        <span className="text-body-3-regular text-teal-gray-400 mb-2 pl-0.5">
          {DEMO_DAY_EDITION}th Demoday
        </span>
        {SIDEBAR_ITEMS.map(({ title, icon, menus }) => (
          <SideBarItem
            key={title}
            title={title}
            icon={icon}
            isOpen={openTitle === title}
            onToggle={() =>
              setOpenTitle((prev) => (prev === title ? "" : title))
            }
          >
            {menus.map((menu) => (
              <SideBarMenuItem key={menu.to} title={menu.title} to={menu.to} />
            ))}
          </SideBarItem>
        ))}
      </div>
    </nav>
  )
}
