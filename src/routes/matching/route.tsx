import { createFileRoute, Outlet } from "@tanstack/react-router"

import { ensureMe } from "@/features/auth/lib/ensureMe"
import Footer from "@/widgets/footer/Footer"
import RecruitingHeader from "@/widgets/navigation/header/RecruitingHeader"
import { MatchingSegmentRegion } from "@/widgets/navigation/sidebar/MatchingSegmentRegion"
import SideBar from "@/widgets/navigation/sidebar/SideBar"

export const Route = createFileRoute("/matching")({
  head: () => ({
    meta: [{ name: "robots", content: "noindex, nofollow" }],
  }),
  beforeLoad: async ({ context, location }) => {
    await ensureMe(context.queryClient, location.href)
  },
  component: MatchingLayout,
})

function MatchingLayout() {
  return (
    <main className="flex h-full min-h-screen w-full flex-col">
      <RecruitingHeader />
      <div className="flex w-full flex-1">
        <SideBar />
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="min-h-200 px-4 pt-6">
            <MatchingSegmentRegion />
            <div className="flex min-w-0 flex-1 flex-col pt-6 pb-20">
              <Outlet />
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  )
}
