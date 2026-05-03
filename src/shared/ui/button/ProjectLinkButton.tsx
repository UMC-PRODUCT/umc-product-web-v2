import { ExternalLink } from "lucide-react"

import { cn } from "@/shared/lib/utils"

interface ProjectLinkButtonProps {
  name: string
  isSelected?: boolean
  onClick?: () => void
  className?: string
}

export function ProjectLinkButton({
  name,
  isSelected = false,
  onClick,
  className,
}: ProjectLinkButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex h-12.5 w-50 items-center gap-1.5 rounded-lg px-3.5 transition-colors",
        isSelected ? "bg-teal-100/80" : "hover:bg-teal-gray-100",
        className,
      )}
    >
      <ExternalLink
        size={24}
        className="text-teal-gray-600 shrink-0"
        aria-hidden="true"
      />
      <span className="text-body-1-medium text-teal-gray-900 truncate">
        {name}
      </span>
    </button>
  )
}
