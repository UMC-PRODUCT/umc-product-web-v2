import { cn } from "@/shared/lib/utils"

import type { ReactNode } from "react"

interface SectionCardProps {
  title: string
  description?: string
  trailing?: ReactNode
  children: ReactNode
  className?: string
}

export function SectionCard({
  title,
  description,
  trailing,
  children,
  className,
}: SectionCardProps) {
  return (
    <section
      className={cn(
        "border-teal-gray-100 flex w-full flex-col gap-5 rounded-[12px] border bg-white px-7 py-6",
        className,
      )}
    >
      <header className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-heading-7-semibold text-teal-gray-900">
            {title}
          </h2>
          {description && (
            <p className="text-body-2-regular text-teal-gray-500">
              {description}
            </p>
          )}
        </div>
        {trailing}
      </header>
      <div className="flex w-full flex-col gap-4">{children}</div>
    </section>
  )
}
