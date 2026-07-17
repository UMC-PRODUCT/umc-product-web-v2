import { CHAPTERS, isChapter } from "@/entities/organization/model/chapters"
import { cn } from "@/shared/lib/utils"
import { SegmentButton } from "@/shared/ui/segment-button/SegmentButton"

const CHAPTER_TAB_ITEMS = [
  { value: "all", label: "전체" },
  ...CHAPTERS.map((chapter) => ({ value: chapter, label: chapter })),
]

interface ChapterTabsProps {
  value: string
  onValueChange: (value: string) => void
  className?: string
}

export function ChapterTabs({
  value,
  onValueChange,
  className,
}: ChapterTabsProps) {
  return (
    <SegmentButton
      items={CHAPTER_TAB_ITEMS}
      value={value}
      onValueChange={(next) => onValueChange(isChapter(next) ? next : "all")}
      className={cn("flex w-full", className)}
      itemClassName="flex-1"
    />
  )
}
