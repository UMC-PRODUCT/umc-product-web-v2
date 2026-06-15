import { useNavigate } from "@tanstack/react-router"

import { cn } from "@/shared/lib/utils"

interface NavigationButtonProps {
  label: string
  to: string
  selected?: boolean
  disabled?: boolean
  className?: string
  onClick?: () => void
}

export default function NavigationButton({
  label,
  to,
  selected = false,
  disabled = false,
  className,
  onClick,
}: NavigationButtonProps) {
  const navigate = useNavigate()
  const sharedClassName = cn(
    "flex h-9 min-w-18 items-center justify-center rounded-full px-4.5 py-1.5 whitespace-nowrap transition-colors",
    selected
      ? "text-subtitle-3-semibold bg-teal-100 text-teal-600"
      : "text-body-1-medium text-teal-gray-600",
    !disabled &&
      !selected &&
      "hover:bg-teal-gray-100 hover:shadow-inner-neutral-3",
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
    <button
      type="button"
      onClick={() => {
        onClick?.()
        void navigate({ to })
      }}
      className={sharedClassName}
    >
      {label}
    </button>
  )
}
