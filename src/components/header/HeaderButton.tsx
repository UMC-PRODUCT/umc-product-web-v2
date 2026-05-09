import DownChevronIcon from "@/shared/assets/icon/chevron/sidebar/DownChevronIcon"
import { cn } from "@/shared/lib/utils"

interface HeaderButtonProps {
  label: string
  type?: "trailing-icon" | "text"
  onClick?: () => void
  className?: string
}

export default function HeaderButton({
  label,
  type = "text",
  onClick,
  className,
}: HeaderButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "text-body-1-medium text-teal-gray-600 hover:bg-teal-gray-100 flex h-9 items-center rounded-full transition-colors",
        type === "trailing-icon" ? "pr-3 pl-4.5" : "px-4.5",
        className,
      )}
    >
      {label}
      {type === "trailing-icon" && (
        <DownChevronIcon className="text-teal-gray-400 ml-0.5 size-4" />
      )}
    </button>
  )
}
