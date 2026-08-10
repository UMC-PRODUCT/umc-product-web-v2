import { cn } from "@/shared/lib/utils"

import type { ReactNode } from "react"

interface BaseSideBarProps {
  ariaLabel: string
  label?: string
  className?: string
  header?: ReactNode
  children: ReactNode
}

export function BaseSideBar({
  ariaLabel,
  label,
  className,
  header,
  children,
}: BaseSideBarProps) {
  return (
    <nav
      aria-label={ariaLabel}
      className={cn(
        "border-teal-gray-200 flex w-55 shrink-0 flex-col items-center justify-start border-r pt-4",
        className,
      )}
    >
      {header}
      <div className="flex flex-col py-4">
        <span className="text-body-3-regular text-teal-gray-400 mb-2 h-4.5 pl-0.5">
          {label}
        </span>
        {children}
      </div>
    </nav>
  )
}
