import { cn } from "@/shared/lib/utils"

interface ChallengerLinkButtonProps {
  name: string
  university: string
  isSelected?: boolean
  onClick?: () => void
  className?: string
}

export function ChallengerLinkButton({
  name,
  university,
  isSelected = false,
  onClick,
  className,
}: ChallengerLinkButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex h-[50px] w-[150px] flex-col items-start justify-center rounded-lg px-3.5 transition-colors",
        isSelected ? "bg-teal-100/80" : "hover:bg-teal-gray-100",
        className,
      )}
    >
      <span className="text-body-2-medium text-teal-gray-900 truncate">
        {name}
      </span>
      <span className="text-caption-3-regular text-teal-gray-600 truncate">
        {university}
      </span>
    </button>
  )
}
