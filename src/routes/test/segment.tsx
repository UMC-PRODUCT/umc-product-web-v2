import { createFileRoute, Outlet } from "@tanstack/react-router"
import { useState } from "react"

import SideBar from "@/components/sidebar/SideBar"
import { Segment, type SegmentItem } from "@/shared/ui/segment/Segment"

export const Route = createFileRoute("/test/segment")({
  component: SegmentWithSidebarLayout,
})

// 이미지의 "프로젝트 설정" 영역처럼 탭 두 개만 보고 싶으면 예시는 이렇게
const DEMO_ITEMS: SegmentItem[] = [
  { id: "notice", label: "공지" },
  { id: "register", label: "프로젝트 등록" },
]

const DEMO_DEFAULT_ID = DEMO_ITEMS[1]?.id ?? DEMO_ITEMS[0]?.id ?? "notice"

function SegmentWithSidebarLayout() {
  const [value, setValue] = useState(DEMO_DEFAULT_ID)

  return (
    <div className="flex min-h-screen w-full">
      <SideBar />
      <main className="min-w-0 flex-1 p-8">
        <h1 className="text-heading-5-semibold text-teal-gray-900 mb-4">
          프로젝트 설정
        </h1>
        <Segment items={DEMO_ITEMS} value={value} onValueChange={setValue} />
        <div className="text-body-1-regular text-teal-gray-600 mt-6">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
