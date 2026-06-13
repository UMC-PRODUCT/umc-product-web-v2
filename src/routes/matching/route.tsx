import { createFileRoute, Outlet } from "@tanstack/react-router"

import Footer from "@/components/footer/Footer"
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
    <main className="flex h-full min-h-screen w-full flex-col">
      <Header />
      <div className="flex w-full flex-1">
        <SideBar />
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="bp2:px-11 bp2:pt-12 min-h-[800px] px-4 pt-6">
            <MatchingSegmentRegion />
            <div className="bp2:pt-8 flex min-w-0 flex-1 flex-col pt-6 pb-20">
              <Outlet />
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  )
}
