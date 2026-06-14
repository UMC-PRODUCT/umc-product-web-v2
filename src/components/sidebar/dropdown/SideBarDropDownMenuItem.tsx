import CheckIcon from "@/shared/assets/icon/check/CheckIcon"
import { cn } from "@/shared/lib/utils"

interface SideBarDropDownMenuItemProps {
  label: string
  isSelected: boolean
  onClick: () => void
}

export function SideBarDropDownMenuItem({
  label,
  isSelected,
  onClick,
}: SideBarDropDownMenuItemProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "text-body-3-regular flex h-6.5 w-full items-center justify-between rounded-[8px] py-1 pr-2 pl-3 text-left",
        isSelected ? "bg-teal-50 text-teal-600" : "text-teal-gray-600",
      )}
    >
      <span className="min-w-0 truncate">{label}</span>
      {isSelected && <CheckIcon className="h-4 w-4" />}
    </button>
  )
}
