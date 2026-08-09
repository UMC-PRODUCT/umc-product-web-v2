import { Link } from "@tanstack/react-router"

import { cn } from "@/shared/lib/utils"

import type { HeaderTone } from "./headerTone"

interface NavigationButtonProps {
  label: string
  to: string
  selected?: boolean
  disabled?: boolean
  className?: string
  onClick?: () => void
  tone?: HeaderTone
}

export default function NavigationButton({
  label,
  to,
  selected = false,
  disabled = false,
  className,
  onClick,
  tone = "light",
}: NavigationButtonProps) {
  const sharedClassName = cn(
    "flex h-9 min-w-18 items-center justify-center rounded-full px-4.5 py-1.5 whitespace-nowrap transition-colors",
    // 선택된 탭은 두 톤이 같다. 시안에서 유리 헤더도 민트 알약을 그대로 쓴다.
    selected
      ? "text-subtitle-3-semibold bg-teal-100 text-teal-600"
      : tone === "glass"
        ? "text-body-1-medium text-teal-gray-200"
        : "text-body-1-medium text-teal-gray-600",
    !disabled &&
      !selected &&
      (tone === "glass"
        ? "hover:text-white"
        : "hover:bg-teal-gray-100 hover:shadow-inner-neutral-3"),
    className,
  )

  if (disabled) {
    return (
      <button type="button" onClick={onClick} className={sharedClassName}>
        {label}
      </button>
    )
  }

  return (
    <Link to={to} onClick={onClick} className={sharedClassName}>
      {label}
    </Link>
  )
}
