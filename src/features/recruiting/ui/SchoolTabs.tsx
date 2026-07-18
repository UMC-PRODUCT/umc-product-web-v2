import { cn } from "@/shared/lib/utils"
import { SegmentButton } from "@/shared/ui/segment-button/SegmentButton"

interface SchoolTabsProps {
  schools: readonly string[]
  value: string
  onValueChange: (value: string) => void
  className?: string
}

export function SchoolTabs({
  schools,
  value,
  onValueChange,
  className,
}: SchoolTabsProps) {
  const items = [
    { value: "all", label: "전체" },
    ...schools.map((school) => ({ value: school, label: school })),
  ]

  return (
    <SegmentButton
      items={items}
      value={value}
      onValueChange={(next) =>
        onValueChange(schools.includes(next) ? next : "all")
      }
      className={cn("flex w-full", className)}
      itemClassName="flex-1"
    />
  )
}
