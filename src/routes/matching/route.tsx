import { createFileRoute, Outlet } from "@tanstack/react-router"

import SideBar from "@/components/sidebar/SideBar"
import { MatchingSegmentRegion } from "@/shared/ui/segment/MatchingSegmentRegion"

export const Route = createFileRoute("/matching")({
  component: MatchingLayout,
})

function MatchingLayout() {
  return (
    <main className="h-full min-h-screen w-full">
      <div className="bg-teal-gray-100 flex h-18 w-full items-center pl-10">
        {/* 추후 헤더 컴포넌트로 교체 */}
      </div>
      <div className="flex w-full">
        <SideBar />
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="px-8.5 pt-14.5">
            <MatchingSegmentRegion />
          </div>
          <div className="flex min-h-0 min-w-0 flex-1 flex-col px-8.5">
            <Outlet />
          </div>
        </div>
      </div>
    </main>
  )
}
