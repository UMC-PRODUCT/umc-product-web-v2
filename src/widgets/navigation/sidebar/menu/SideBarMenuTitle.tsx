import { cn } from "@/shared/lib/utils"

import type { ComponentType, SVGProps } from "react"

interface SideBarMenuTitleProps {
  title: string
  icon: ComponentType<SVGProps<SVGSVGElement>>
  isActive: boolean
}

export function SideBarMenuTitle({
  title,
  icon: Icon,
  isActive,
}: SideBarMenuTitleProps) {
  return (
    <div className="flex h-12 w-full items-center">
      <div
        className={cn(
          "flex h-12 w-39 items-center gap-2 rounded-[12px] pl-3",
          isActive ? "shadow-inner-primary-1 bg-teal-100" : "",
        )}
      >
        <Icon
          aria-hidden="true"
          className={cn(
            "h-5 w-5",
            isActive ? "text-teal-600" : "text-teal-gray-400",
          )}
        />
        <div
          className={cn(
            "text-subtitle-3-semibold",
            isActive ? "text-teal-600" : "text-teal-gray-600",
          )}
        >
          {title}
        </div>
      </div>
    </div>
  )
}
