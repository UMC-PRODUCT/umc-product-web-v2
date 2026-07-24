import { createFileRoute, Outlet, useRouterState } from "@tanstack/react-router"

import RightChevronIconFilled from "@/shared/assets/icon/chevron/filled/RightChevronIconFilled"
import Footer from "@/widgets/footer/Footer"
import RecruitingHeader from "@/widgets/navigation/header/RecruitingHeader"
import SideBar from "@/widgets/navigation/sidebar/SideBar"

export const Route = createFileRoute("/projects")({
  head: () => ({
    meta: [{ name: "robots", content: "noindex, nofollow" }],
  }),
  component: ProjectsLayout,
})

function ProjectsLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const normalizedPathname = pathname.replace(/\/$/, "") || "/projects"

  let breadcrumb = ""
  let title = ""
  let description: string | undefined = undefined

  if (normalizedPathname === "/projects/notice") {
    breadcrumb = "모집 공고"
    title = "모집 공고"
    description = "학교별 모집 공고를 확인하고 지원할 수 있습니다."
  } else if (normalizedPathname.startsWith("/projects/application")) {
    breadcrumb = "내 지원서"
    title = "내 지원서"
    description = "이메일과 지원 코드로 내 지원서를 확인할 수 있습니다."
  } else {
    // Default fallback for /projects and other sub-paths
    breadcrumb = "지원 방법"
    title = "지원 방법"
    description = undefined
  }

  return (
    <main className="flex h-full min-h-screen w-full flex-col">
      <RecruitingHeader />
      <div className="flex w-full flex-1">
        <SideBar />
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="min-h-200 pt-10 pl-8">
            <div className="flex flex-col gap-6.5 pl-3">
              <div className="flex h-5.5 items-center gap-1">
                <p className="text-body-2-medium text-teal-gray-400">
                  리크루팅
                </p>
                <RightChevronIconFilled className="text-teal-gray-300 h-4 w-4" />
                <p className="text-body-2-medium text-teal-gray-400">
                  지원하기
                </p>
                <RightChevronIconFilled className="text-teal-gray-300 h-4 w-4" />
                <p className="text-body-2-medium text-teal-gray-400">
                  {breadcrumb}
                </p>
              </div>

              <div className="flex flex-col gap-3">
                <p className="text-heading-5-semibold text-teal-gray-900">
                  {title}
                </p>
                {description && (
                  <p className="text-body-2-regular text-teal-gray-600">
                    {description}
                  </p>
                )}
              </div>
            </div>
            <div className="flex min-w-0 flex-1 flex-col pt-8 pb-20">
              <Outlet />
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  )
}
