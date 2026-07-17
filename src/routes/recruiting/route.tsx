import { createFileRoute, Outlet } from "@tanstack/react-router"

import { ensureMe } from "@/features/auth/lib/ensureMe"
import Footer from "@/widgets/footer/Footer"
import Header from "@/widgets/navigation/header/Header"
import RecruitingSideBar from "@/widgets/navigation/sidebar/RecruitingSideBar"

export const Route = createFileRoute("/recruiting")({
  head: () => ({
    meta: [{ name: "robots", content: "noindex, nofollow" }],
  }),
  beforeLoad: async ({ context, location }) => {
    await ensureMe(context.queryClient, location.href)
  },
  component: RecruitingLayout,
})

function RecruitingLayout() {
  return (
    <main className="flex h-full min-h-screen w-full flex-col">
      <Header />
      <div className="flex w-full flex-1">
        <RecruitingSideBar />
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="min-h-200 px-8 pt-10 pb-20">
            <Outlet />
          </div>
        </div>
      </div>
      <Footer />
    </main>
  )
}
