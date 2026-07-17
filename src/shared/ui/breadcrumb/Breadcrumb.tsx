import RightChevronIcon from "@/shared/assets/icon/chevron/RightChevronIcon"
import { cn } from "@/shared/lib/utils"

interface BreadcrumbProps {
  items: string[]
  className?: string
}

export function Breadcrumb({ items, className }: BreadcrumbProps) {
  return (
    <nav
      aria-label="breadcrumb"
      className={cn("flex items-center gap-1", className)}
    >
      {items.map((item, index) => (
        <span key={item} className="flex items-center gap-1">
          {index > 0 && (
            <RightChevronIcon
              aria-hidden="true"
              className="text-teal-gray-400 size-4"
            />
          )}
          <span className="text-body-2-medium text-teal-gray-400">{item}</span>
        </span>
      ))}
    </nav>
  )
}
