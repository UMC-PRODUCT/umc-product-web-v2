import { useMemo } from "react"

import { useSchoolChapterMap } from "@/entities/organization/hooks/useSchoolChapterMap"
import { CHAPTERS } from "@/entities/organization/model/chapters"
import { cn } from "@/shared/lib/utils"
import { SegmentButton } from "@/shared/ui/segment-button/SegmentButton"

interface ChapterTabsProps {
  value: string
  onValueChange: (value: string) => void
  chapters?: Array<{ chapterId: string | number; chapterName: string } | string>
  allLabel?: string
  className?: string
}

export function ChapterTabs({
  value,
  onValueChange,
  chapters: customChapters,
  allLabel = "전체",
  className,
}: ChapterTabsProps) {
  const { chapters: serverChapters } = useSchoolChapterMap()

  const chapterOptions = useMemo(() => {
    if (customChapters && customChapters.length > 0) {
      return customChapters.map((ch) =>
        typeof ch === "string"
          ? { value: ch, label: ch }
          : { value: ch.chapterName, label: ch.chapterName },
      )
    }
    if (serverChapters && serverChapters.length > 0) {
      return serverChapters.map(
        (ch: { chapterId: string | number; chapterName: string }) => ({
          value: ch.chapterName,
          label: ch.chapterName,
        }),
      )
    }
    return CHAPTERS.map((chapter) => ({ value: chapter, label: chapter }))
  }, [customChapters, serverChapters])

  const items = useMemo(
    () => [{ value: "all", label: allLabel }, ...chapterOptions],
    [allLabel, chapterOptions],
  )

  const validValues = useMemo(
    () => new Set(items.map((item) => item.value)),
    [items],
  )

  return (
    <SegmentButton
      items={items}
      value={value}
      onValueChange={(next) =>
        onValueChange(validValues.has(next) ? next : "all")
      }
      className={cn("flex w-full", className)}
      itemClassName="flex-1"
    />
  )
}
