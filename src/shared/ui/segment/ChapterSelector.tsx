import { cva } from "class-variance-authority"

import { cn } from "@/shared/lib/utils"

export const CHAPTERS = [
  "Chromium",
  "Ferrum",
  "Neon",
  "Platinum",
  "Selenium",
  "Xenon",
] as const

export type Chapter = (typeof CHAPTERS)[number]

const chapterSelectorVariants = cva(
  "inline-flex h-9.5 w-full flex-1 basis-0 items-center justify-center whitespace-nowrap rounded-[12px] transition-colors",
  {
    variants: {
      selected: {
        true: "bg-white text-teal-gray-800 text-label-1-semibold shadow-drop-neutral-2",
        false: "bg-transparent text-teal-600 text-subtitle-3-semibold",
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
  className?: string
}

export function ChapterSelector({
  selectedChapter,
  onChapterChange,
  className,
}: ChapterSelectorProps) {
  return (
    <div
      className={cn(
        "bg-teal-gray-100 shadow-inner-neutral-2 flex h-11.5 w-full items-center gap-2 rounded-[14px] p-1",
        className,
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
