import { cn } from "@/shared/lib/utils"

import type { ComponentType, SVGProps } from "react"

interface SideBarMenuTitleProps {
  id: string
  title: string
  icon: ComponentType<SVGProps<SVGSVGElement>>
  isActive: boolean
  isOpen: boolean
  onToggle: () => void
}

export function SideBarMenuTitle({
  id,
  title,
  icon: Icon,
  isActive,
  isOpen,
  onToggle,
}: SideBarMenuTitleProps) {
  const isHighlighted = isActive || isOpen

  return (
    <button
      className="flex h-12 w-full items-center"
      onClick={onToggle}
      aria-expanded={isOpen}
      aria-controls={`sidebar-menu-${id}`}
    >
      <div
        className={cn(
          "hover:bg-teal-gray-100 flex h-12 w-39 items-center gap-2 rounded-[12px] pl-3 transition-all duration-200 ease-in-out",
          isHighlighted
            ? "shadow-inner-primary-1 bg-teal-100 hover:bg-teal-100"
            : "",
        )}
      >
        <Icon
          aria-hidden="true"
          className={cn(
            "h-5 w-5",
            isHighlighted ? "text-teal-600" : "text-teal-gray-400",
          )}
        />
        <div
          className={cn(
            "text-subtitle-3-semibold",
            isHighlighted ? "text-teal-600" : "text-teal-gray-600",
          )}
        >
          {title}
        </div>
      </div>
    </button>
  )
}
