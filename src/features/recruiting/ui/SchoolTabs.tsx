import { cn } from "@/shared/lib/utils"
import { SegmentButton } from "@/shared/ui/segment-button/SegmentButton"

interface SchoolTabsProps {
  schools: readonly string[]
  value: string
  onValueChange: (value: string) => void
  allLabel?: string
  className?: string
}

export function SchoolTabs({
  schools,
  value,
  onValueChange,
  allLabel = "학교 전체",
  className,
}: SchoolTabsProps) {
  const items = [
    { value: "all", label: allLabel },
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
