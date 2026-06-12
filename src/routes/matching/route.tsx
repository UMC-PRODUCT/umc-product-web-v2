import { createFileRoute, Outlet, useMatchRoute } from "@tanstack/react-router"

import Footer from "@/components/footer/Footer"
import Header from "@/components/header/Header"
import { MatchingSegmentRegion } from "@/components/sidebar/MatchingSegmentRegion"
import SideBar from "@/components/sidebar/SideBar"
import { ensureMe } from "@/features/auth/lib/ensureMe"
import { cn } from "@/shared/lib/utils"

export const Route = createFileRoute("/matching")({
  beforeLoad: async ({ context }) => {
    await ensureMe(context.queryClient)
  },
  component: MatchingLayout,
})

function MatchingLayout() {
  const matchRoute = useMatchRoute()
  const isProjectsIndex = Boolean(matchRoute({ to: "/matching/projects" }))
  return (
    <main className="flex h-full min-h-screen w-full flex-col">
      <Header />
      <div className="flex w-full flex-1">
        <SideBar />
        <div className="flex min-w-0 flex-1 flex-col">
          <div
            className={cn(
              "px-4 pt-6 min-[960px]:pt-12",
              isProjectsIndex ? "min-[960px]:px-9.5" : "min-[960px]:px-11",
            )}
          >
            <MatchingSegmentRegion />
            <div className="flex min-w-0 flex-1 flex-col pt-6 pb-20 min-[960px]:pt-8">
              <Outlet />
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  )
}
