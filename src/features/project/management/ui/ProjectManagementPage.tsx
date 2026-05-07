import { useState } from "react"

import {
  type Chapter,
  ChapterSelector,
} from "@/shared/ui/segment/ChapterSelector"

export function ProjectManagementPage() {
  const [selectedChapter, setSelectedChapter] = useState<Chapter>("Chromium")

  return (
    <section className="relative flex w-full flex-col items-start justify-start pt-8">
      <div className="border-teal-gray-150 relative z-30 flex h-full min-w-242 flex-col gap-5 rounded-xl border bg-white px-8.5 py-8">
        <div className="flex flex-col items-start gap-1.5">
          <span className="text-heading-6-semibold text-teal-gray-900">
            프로젝트 관리
          </span>
          <span className="text-body-2-regular text-teal-gray-600">
            모든 프로젝트의 상세 정보를 확인하고 수정할 수 있습니다.
            <br />
            단, 매칭 중에는 일부 수정이 제한됩니다.
          </span>
        </div>
        <ChapterSelector
          selectedChapter={selectedChapter}
          onChapterChange={setSelectedChapter}
        />
      </div>
    </section>
  )
}
