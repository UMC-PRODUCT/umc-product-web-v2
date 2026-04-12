import { useState } from "react"

import { SIDEBAR_ITEMS } from "./sidebar.config"
import { SideBarItem } from "./SideBarItem"
import { SideBarMenuItem } from "./SideBarMenuItem"

const DEMO_DAY_EDITION = 10

export default function SideBar() {
  const [openTitle, setOpenTitle] = useState<string>(
    SIDEBAR_ITEMS[0]?.title ?? "",
  )

  return (
    <aside className="border-teal-grey-200 flex h-fit w-55 flex-col items-center justify-start border-r py-4">
      {/* Dropdown 영역 - Admin 권한 소유자에게만 노출 */}
      <section className="flex flex-col gap-1.5 py-4">
        <span className="text-body-3-regular text-teal-gray-400">
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
      </section>
    </aside>
  )
}
