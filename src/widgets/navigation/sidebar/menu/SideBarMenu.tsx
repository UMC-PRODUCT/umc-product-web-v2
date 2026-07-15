import { SideBarMenuTitle } from "./SideBarMenuTitle"

import type { ComponentType, SVGProps } from "react"

interface SideBarMenuProps {
  id: string
  title: string
  icon: ComponentType<SVGProps<SVGSVGElement>>
  isActive: boolean
  children: React.ReactNode
}

export function SideBarMenu({
  id,
  title,
  icon,
  isActive,
  children,
}: SideBarMenuProps) {
  return (
    <div className="flex w-42 flex-col">
      <SideBarMenuTitle title={title} icon={icon} isActive={isActive} />
      <div
        id={`sidebar-menu-${id}`}
        role="region"
        className="flex flex-col gap-1 py-0.5"
      >
        {children}
      </div>
    </div>
  )
}
