import { cn } from "@/shared/lib/utils"

import type { ReactNode } from "react"

interface FieldRowProps {
  label: string
  htmlFor?: string
  required?: boolean
  error?: string
  hint?: string
  children: ReactNode
  className?: string
}

export function FieldRow({
  label,
  htmlFor,
  required,
  error,
  hint,
  children,
  className,
}: FieldRowProps) {
  return (
    <div className={cn("flex w-full flex-col gap-1.5", className)}>
      <label
        htmlFor={htmlFor}
        className="text-label-1-medium text-teal-gray-700"
      >
        {label}
        {required && <span className="text-error-500 ml-1">*</span>}
      </label>
      {children}
      {error ? (
        <p className="text-caption-2-medium text-error-500">{error}</p>
      ) : hint ? (
        <p className="text-caption-2-medium text-teal-gray-400">{hint}</p>
      ) : null}
    </div>
  )
}
