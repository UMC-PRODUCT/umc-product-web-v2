import { useCallback, useEffect, useRef, useState } from "react"

import SchoolIcon from "@/shared/assets/icon/school/SchoolIcon"
import { cn } from "@/shared/lib/utils"

// 지부 목록은 서버 응답에서 오므로 개수와 이름을 카드가 가정하지 않는다.
// 표시 순서는 받은 배열 순서를 그대로 따른다(정렬 책임은 호출부).
interface ChapterSchools {
  chapterId: string
  chapterName: string
  schools: string[]
}

interface SchoolListCardProps {
  totalCount: number
  chapters: ChapterSchools[]
}

export function SchoolListCard({ totalCount, chapters }: SchoolListCardProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  // 스크롤 여지가 있고 아직 맨 아래가 아닐 때만 페이드 노출(마지막 요소를 안 가리게).
  const [showFade, setShowFade] = useState(false)

  const updateFade = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    const canScroll = el.scrollHeight - el.clientHeight > 1
    const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 1
    setShowFade(canScroll && !atBottom)
  }, [])

  useEffect(() => {
    updateFade()
  }, [updateFade, chapters])

  return (
    <div className="border-teal-gray-100 shadow-drop-neutral-3 flex h-70 w-82 flex-col gap-5 rounded-xl border bg-white px-6 pt-7 pb-3">
      <div className="flex items-center gap-2.5">
        <SchoolIcon className="size-7.5 shrink-0 text-teal-700" />
        <p className="text-heading-6-semibold text-teal-700">
          총 {totalCount} 학교
        </p>
      </div>

      <div className="relative">
        <div
          ref={scrollRef}
          onScroll={updateFade}
          className="scrollbar-hide flex h-47.5 flex-col gap-4 overflow-x-clip overflow-y-auto"
        >
          {chapters.map(({ chapterId, chapterName, schools }) => (
            <div key={chapterId} className="flex gap-4">
              <p className="text-subtitle-4-semibold w-20 shrink-0 text-teal-600">
                {chapterName}
              </p>
              <div className="grid flex-1 grid-cols-2 gap-x-4 gap-y-1.5">
                {schools.map((school) => (
                  <p
                    key={school}
                    className="text-body-2-medium text-teal-gray-600"
                  >
                    {school}
                  </p>
                ))}
              </div>
            </div>
          ))}
        </div>
        {/* 하단 스크롤 페이드(24px): 더 볼 게 있을 때만 노출, 맨 아래에선 사라짐. */}
        <div
          className={cn(
            "pointer-events-none absolute inset-x-0 bottom-0 h-6 bg-linear-to-b from-white/20 to-white transition-opacity duration-200",
            showFade ? "opacity-100" : "opacity-0",
          )}
        />
      </div>
    </div>
  )
}
