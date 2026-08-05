import { Link } from "@tanstack/react-router"

import { cn } from "@/shared/lib/utils"

import type { ComponentType, SVGProps } from "react"

interface FlatSideBarItemProps {
  title: string
  to: string
  icon: ComponentType<SVGProps<SVGSVGElement>>
  isActive: boolean
}

export function FlatSideBarItem({
  title,
  to,
  icon: Icon,
  isActive,
}: FlatSideBarItemProps) {
  return (
    <Link
      to={to}
      aria-current={isActive ? "page" : undefined}
      className="flex h-12 w-42 items-center"
    >
      <span
        className={cn(
          "hover:bg-teal-gray-100 flex h-12 w-39 items-center gap-2 rounded-[12px] pl-3 transition-all duration-200 ease-in-out",
          isActive && "shadow-inner-primary-1 bg-teal-100 hover:bg-teal-100",
        )}
      >
        <Icon
          aria-hidden="true"
          className={cn(
            "h-5 w-5",
            isActive ? "text-teal-600" : "text-teal-gray-400",
          )}
        />
        <span
          className={cn(
            "text-subtitle-3-semibold",
            isActive ? "text-teal-600" : "text-teal-gray-600",
          )}
        >
          {title}
        </span>
      </span>
    </Link>
  )
}
