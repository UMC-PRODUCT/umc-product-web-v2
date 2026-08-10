import { cn } from "@/shared/lib/utils"
import {
  Breadcrumb,
  type BreadcrumbItem,
} from "@/shared/ui/breadcrumb/Breadcrumb"

interface PageLabelProps {
  breadcrumb: readonly BreadcrumbItem[]
  title: string
  description?: string
  className?: string
}

export function PageLabel({
  breadcrumb,
  title,
  description,
  className,
}: PageLabelProps) {
  return (
    <div className={cn("flex flex-col gap-6.5", className)}>
      <Breadcrumb items={breadcrumb} />
      <div className="flex flex-col gap-3">
        <h1 className="text-heading-5-semibold text-teal-gray-900">{title}</h1>
        {description && (
          <p className="text-body-2-regular text-teal-gray-600">
            {description}
          </p>
        )}
      </div>
    </div>
  )
}
