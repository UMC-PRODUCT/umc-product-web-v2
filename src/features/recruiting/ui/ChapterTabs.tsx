import { useMemo } from "react"

import { useSchoolChapterMap } from "@/entities/organization/hooks/useSchoolChapterMap"
import { cn } from "@/shared/lib/utils"
import { SegmentButton } from "@/shared/ui/segment-button/SegmentButton"

interface ChapterTabsProps {
  value: string
  onValueChange: (value: string) => void
  chapters?: Array<{ chapterId: string | number; chapterName: string } | string>
  allLabel?: string
  className?: string
  gisuId?: number
}

export function ChapterTabs({
  value,
  onValueChange,
  chapters: customChapters,
  allLabel = "전체",
  className,
  gisuId,
}: ChapterTabsProps) {
  const { chapters: serverChapters } = useSchoolChapterMap({ gisuId })

  const chapterOptions = useMemo(() => {
    if (customChapters && customChapters.length > 0) {
      return customChapters.map((ch) => {
        const chapterName = typeof ch === "string" ? ch : ch.chapterName
        return {
          value: chapterName,
          label: chapterName,
          tooltipContent: chapterName,
        }
      })
    }
    if (serverChapters && serverChapters.length > 0) {
      return serverChapters.map(
        (ch: { chapterId: string | number; chapterName: string }) => ({
          value: ch.chapterName,
          label: ch.chapterName,
          tooltipContent: ch.chapterName,
        }),
      )
    }
    return []
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
