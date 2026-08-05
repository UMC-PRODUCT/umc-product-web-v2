import { createFileRoute, Outlet } from "@tanstack/react-router"

import { ensureMe } from "@/features/auth/lib/ensureMe"
import { SETTINGS_SIDEBAR_ITEMS } from "@/shared/config/settingsNavigation"
import { useActiveGeneration } from "@/shared/hooks/useActiveGisu"
import { toUmcGisuLabel } from "@/shared/lib/gisuLabel"
import Footer from "@/widgets/footer/Footer"
import RecruitingHeader from "@/widgets/navigation/header/RecruitingHeader"
import { FlatSideBar } from "@/widgets/navigation/sidebar/FlatSideBar"

export const Route = createFileRoute("/manage")({
  head: () => ({
    meta: [{ name: "robots", content: "noindex, nofollow" }],
  }),
  beforeLoad: async ({ context, location }) => {
    await ensureMe(context.queryClient, location.href)
  },
  component: ManageLayout,
})

function ManageLayout() {
  const { data: generation } = useActiveGeneration()

  return (
    <main className="flex h-full min-h-screen w-full flex-col">
      <RecruitingHeader />
      <div className="flex w-full flex-1">
        <FlatSideBar
          ariaLabel="설정 사이드 메뉴"
          label={toUmcGisuLabel(generation)}
          items={SETTINGS_SIDEBAR_ITEMS}
        />
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
