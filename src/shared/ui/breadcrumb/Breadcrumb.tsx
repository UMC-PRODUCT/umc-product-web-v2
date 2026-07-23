import { Link } from "@tanstack/react-router"

import RightChevronIconSmall from "@/shared/assets/icon/chevron/RightChevronIconSmall"

export interface BreadcrumbItem {
  id: string
  label: string
  to?: string
}

interface BreadcrumbProps {
  items: readonly BreadcrumbItem[]
  className?: string
}

export function Breadcrumb({ items, className }: BreadcrumbProps) {
  return (
    <nav aria-label="breadcrumb" className={className}>
      <ol className="flex items-center gap-1">
        {items.map((item, index) => {
          const isCurrent = index === items.length - 1
          const itemClassName =
            "text-body-2-medium text-teal-gray-400 whitespace-nowrap"

          return (
            <li key={item.id} className="flex items-center gap-1">
              {index > 0 && (
                <RightChevronIconSmall
                  aria-hidden="true"
                  className="text-teal-gray-300 size-4"
                />
              )}
              {item.to && !isCurrent ? (
                <Link to={item.to} className={itemClassName}>
                  {item.label}
                </Link>
              ) : (
                <span
                  aria-current={isCurrent ? "page" : undefined}
                  className={itemClassName}
                >
                  {item.label}
                </span>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
