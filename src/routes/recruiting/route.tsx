import { createFileRoute, Outlet, redirect } from "@tanstack/react-router"

import { isRecruitingOperator } from "@/entities/member/model/identity"
import { ensureMe } from "@/features/auth/lib/ensureMe"
import { notifyAccessDenied } from "@/shared/lib/accessDenied"
import Footer from "@/widgets/footer/Footer"
import RecruitingHeader from "@/widgets/navigation/header/RecruitingHeader"
import RecruitingSideBar from "@/widgets/navigation/sidebar/RecruitingSideBar"

export const Route = createFileRoute("/recruiting")({
  head: () => ({
    meta: [{ name: "robots", content: "noindex, nofollow" }],
  }),
  beforeLoad: async ({ context, location }) => {
    const me = await ensureMe(context.queryClient, location.href)
    // 리크루팅은 운영진 전용이다. 헤더에서 탭을 감추는 것만으로는 주소를 직접
    // 친 진입을 막지 못해, 역할이 없는 챌린저까지 들어오고 있었다.
    if (!isRecruitingOperator(me)) {
      notifyAccessDenied()
      throw redirect({ to: "/" })
    }
  },
  component: RecruitingLayout,
})

function RecruitingLayout() {
  return (
    <main className="flex h-full min-h-screen w-full flex-col">
      <RecruitingHeader />
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
