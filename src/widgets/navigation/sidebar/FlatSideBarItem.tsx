import { Link } from "@tanstack/react-router"

import { cn } from "@/shared/lib/utils"

import type { ComponentType, SVGProps } from "react"

interface FlatSideBarItemProps {
  title: string
  to: string
  icon: ComponentType<SVGProps<SVGSVGElement>>
  isActive: boolean
  disabled?: boolean
}

export function FlatSideBarItem({
  title,
  to,
  icon: Icon,
  isActive,
  disabled = false,
}: FlatSideBarItemProps) {
  const body = (
    <span
      className={cn(
        "flex h-12 w-39 items-center gap-2 rounded-[12px] pl-3 transition-all duration-200 ease-in-out",
        !disabled && "hover:bg-teal-gray-100",
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
  )

  // 대응 라우트가 아직 없는 항목은 링크로 만들면 눌렀을 때 갈 곳이 없다.
  if (disabled) {
    return (
      <span
        aria-current={isActive ? "page" : undefined}
        aria-disabled="true"
        className="flex h-12 w-42 items-center"
      >
        {body}
      </span>
    )
  }

  return (
    <Link
      to={to}
      aria-current={isActive ? "page" : undefined}
      className="flex h-12 w-42 items-center"
    >
      {body}
    </Link>
  )
}
