import { cn } from "@/lib/utils"

import type { ComponentType, SVGProps } from "react"

interface SideBarItemTitleProps {
  title: string
  icon: ComponentType<SVGProps<SVGSVGElement>>
  isOpen: boolean
  onToggle: () => void
}

export function SideBarItemTitle({
  title,
  icon: Icon,
  isOpen,
  onToggle,
}: SideBarItemTitleProps) {
  return (
    <button
      className="flex h-12 w-full items-center"
      onClick={onToggle}
      aria-expanded={isOpen}
      aria-controls={`sidebar-menu-${title}`}
    >
      <div
        className={cn(
          "hover:bg-teal-gray-100 flex h-12 w-39 items-center gap-2 rounded-[12px] pl-3 transition-all duration-200 ease-in-out",
          isOpen ? "shadow-inner-primary-1 bg-teal-100 hover:bg-teal-100" : "",
        )}
      >
        <Icon
          aria-hidden="true"
          className={cn(
            "h-5 w-5",
            isOpen ? "text-teal-600" : "text-teal-gray-400",
          )}
        />
        <div
          className={cn(
            "text-subtitle-3-semibold",
            isOpen ? "text-teal-600" : "text-teal-gray-600",
          )}
        >
          {title}
        </div>
      </div>
    </button>
  )
}
