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

  // 프로젝트 목록은 지원하기 흐름이 아니라 독립 화면이라 상위 경로가 다르다.
  let trail: string[] = []
  let title = ""
  let description: string | undefined = undefined

  if (normalizedPathname === "/projects") {
    trail = ["프로젝트"]
    title = "프로젝트"
    description = "UMC 에서 진행 중인 프로젝트를 확인할 수 있습니다."
  } else if (normalizedPathname === "/projects/notice") {
    trail = ["리크루팅", "지원하기", "모집 공고"]
    title = "모집 공고"
    description = "학교별 모집 공고를 확인하고 지원할 수 있습니다."
  } else if (normalizedPathname.startsWith("/projects/apply")) {
    trail = ["리크루팅", "지원하기", "지원서 작성"]
    title = "지원서 작성"
    description = "모집 문항에 답해 지원서를 제출합니다."
  } else if (normalizedPathname.startsWith("/projects/application")) {
    trail = ["리크루팅", "지원하기", "내 지원서"]
    title = "내 지원서"
    description = "이메일과 지원 코드로 내 지원서를 확인할 수 있습니다."
  } else {
    trail = ["리크루팅", "지원하기"]
    title = "지원하기"
    description = undefined
  }

  return (
    <main className="flex h-full min-h-screen w-full flex-col">
      <RecruitingHeader />
      <div className="flex w-full flex-1">
        <SideBar />
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="min-h-200 px-8 pt-10">
            <div className="flex flex-col gap-6.5 pl-3">
              <div className="flex h-5.5 items-center gap-1">
                {trail.map((crumb, index) => (
                  <div key={crumb} className="flex items-center gap-1">
                    {index > 0 && (
                      <RightChevronIconFilled className="text-teal-gray-300 h-4 w-4" />
                    )}
                    <p className="text-body-2-medium text-teal-gray-400">
                      {crumb}
                    </p>
                  </div>
                ))}
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
