import { createFileRoute, Outlet } from "@tanstack/react-router"

import SideBar from "@/components/sidebar/SideBar"

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
        <Outlet />
      </div>
    </main>
  )
}
