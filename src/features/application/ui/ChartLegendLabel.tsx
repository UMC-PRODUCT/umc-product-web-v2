import { cn } from "@/shared/lib/utils"

interface ChartLegendLabelProps {
  color: string
  label: string
  className?: string
}

export function ChartLegendLabel({
  color,
  label,
  className,
}: ChartLegendLabelProps) {
  return (
    <span className={cn("inline-flex items-center gap-1.5", className)}>
      <span
        className="size-2.5 shrink-0 rounded-full"
        style={{ backgroundColor: color }}
      />
      <span className="text-caption-1-medium text-teal-gray-700 whitespace-nowrap">
        {label}
      </span>
    </span>
  )
}
