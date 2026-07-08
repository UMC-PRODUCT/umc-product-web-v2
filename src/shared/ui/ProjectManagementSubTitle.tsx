import { cn } from "@/shared/lib/utils"

import type { ReactNode } from "react"

interface ProjectManagementSubTitleProps {
  title: string
  children?: ReactNode
  className?: string
}

export function ProjectManagementSubTitle({
  title,
  children,
  className,
}: ProjectManagementSubTitleProps) {
  return (
    <div className={cn("flex items-center gap-3 pl-4", className)}>
      <span className="text-heading-7-semibold text-teal-600">{title}</span>
      {children}
    </div>
  )
}
