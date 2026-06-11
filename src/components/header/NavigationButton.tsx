import { Link } from "@tanstack/react-router"

import { cn } from "@/shared/lib/utils"

interface NavigationButtonProps {
  label: string
  to: string
  selected?: boolean
  disabled?: boolean
}

export default function NavigationButton({
  label,
  to,
  selected = false,
  disabled = false,
}: NavigationButtonProps) {
  return (
    <Link
      to={to}
      disabled={disabled}
      className={cn(
        "flex h-9 min-w-18 items-center justify-center rounded-full px-4.5 py-1.5 transition-colors",
        selected
          ? "text-subtitle-3-semibold bg-teal-100 text-teal-600"
          : "text-body-1-medium text-teal-gray-600",
        !disabled &&
          !selected &&
          "hover:bg-teal-gray-100 hover:shadow-inner-neutral-3",
        disabled && "pointer-events-none",
      )}
    >
      {label}
    </Link>
  )
}
