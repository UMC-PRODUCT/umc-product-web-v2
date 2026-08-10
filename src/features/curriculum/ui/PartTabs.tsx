import { cn } from "@/shared/lib/utils"
import { SegmentButton } from "@/shared/ui/segment-button/SegmentButton"

const PART_TAB_ITEMS = [
  { value: "PM", label: "PM" },
  { value: "Design", label: "Design" },
  { value: "Web PE", label: "Web PE" },
  { value: "Mobile PE", label: "Mobile PE" },
  { value: "Infra Plus", label: "Infra Plus" },
]

interface PartTabsProps {
  value?: string
  onValueChange?: (value: string) => void
  className?: string
}

export function PartTabs({
  value = "PM",
  onValueChange,
  className,
}: PartTabsProps) {
  return (
    <SegmentButton
      items={PART_TAB_ITEMS}
      value={value}
      onValueChange={(next) => onValueChange?.(next)}
      className={cn("flex w-full", className)}
      itemClassName="flex-1"
    />
  )
}
