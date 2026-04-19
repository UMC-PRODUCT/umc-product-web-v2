import { cva } from "class-variance-authority"

import { cn } from "@/shared/lib/utils"

const CHAPTERS = [
  "Chromium",
  "Ferrum",
  "Neon",
  "Platinum",
  "Selenium",
  "Xenon",
] as const

type Chapter = (typeof CHAPTERS)[number]

const chapterSelectorVariants = cva(
  "inline-flex h-9.5 shrink-0 items-center justify-center whitespace-nowrap text-label-1-medium",
  {
    variants: {
      selected: {
        true: "w-35.5 rounded-[12px] bg-white text-teal-gray-800 shadow-drop-neutral-2",
        false: "px-0 text-teal-600",
      },
    },
    defaultVariants: {
      selected: false,
    },
  },
)

interface ChapterSelectorProps {
  selectedChapter: Chapter
  onChapterChange: (chapter: Chapter) => void
}

export function ChapterSelector({
  selectedChapter,
  onChapterChange,
}: ChapterSelectorProps) {
  return (
    <div
      className={cn(
        "bg-teal-gray-50 shadow-inner-neutral-2 flex h-11.5 w-full min-w-225 items-center justify-between rounded-[14px] p-1",
      )}
    >
      {CHAPTERS.map((chapter) => {
        const isSelected = chapter === selectedChapter

        return (
          <button
            key={chapter}
            type="button"
            aria-pressed={isSelected}
            onClick={() => onChapterChange(chapter)}
            className={chapterSelectorVariants({ selected: isSelected })}
          >
            {chapter}
          </button>
        )
      })}
    </div>
  )
}
