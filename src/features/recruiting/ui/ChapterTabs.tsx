import { CHAPTERS, isChapter } from "@/entities/organization/model/chapters"
import { cn } from "@/shared/lib/utils"
import { SegmentButton } from "@/shared/ui/segment-button/SegmentButton"

interface ChapterTabsProps {
  value: string
  onValueChange: (value: string) => void
  allLabel?: string
  className?: string
}

export function ChapterTabs({
  value,
  onValueChange,
  allLabel = "전체",
  className,
}: ChapterTabsProps) {
  const items = [
    { value: "all", label: allLabel },
    ...CHAPTERS.map((chapter) => ({ value: chapter, label: chapter })),
  ]

  return (
    <SegmentButton
      items={items}
      value={value}
      onValueChange={(next) => onValueChange(isChapter(next) ? next : "all")}
      className={cn("flex w-full", className)}
      itemClassName="flex-1"
    />
  )
}
