import { createFileRoute, Outlet } from "@tanstack/react-router"

import Header from "@/components/header/Header"
import { MatchingSegmentRegion } from "@/components/sidebar/MatchingSegmentRegion"
import SideBar from "@/components/sidebar/SideBar"
import { ensureMe } from "@/features/auth/lib/ensureMe"

export const Route = createFileRoute("/matching")({
  beforeLoad: async ({ context }) => {
    await ensureMe(context.queryClient)
  },
  component: MatchingLayout,
})

function MatchingLayout() {
  return (
    <main className="h-full min-h-screen w-full">
      <Header />
      <div className="flex w-full">
        <SideBar />
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="px-4 pt-6 min-[960px]:px-8.5 min-[960px]:pt-14.5">
            <MatchingSegmentRegion />
          </div>
          <div className="flex min-h-screen min-w-0 flex-1 flex-col px-4 pt-6 min-[960px]:px-8.5 min-[960px]:pt-8">
            <Outlet />
          </div>
        </div>
      </div>
    </main>
  )
}
