import { createFileRoute } from "@tanstack/react-router"

import { MatchingProjectsListPage } from "@/features/project/list"
import Header from "@/widgets/navigation/header/Header"
import { MatchingSegmentRegion } from "@/widgets/navigation/sidebar/MatchingSegmentRegion"
import SideBar from "@/widgets/navigation/sidebar/SideBar"

export const Route = createFileRoute("/test/matching-projects")({
  component: MatchingProjectsTestPage,
})

function MatchingProjectsTestPage() {
  const activePathname = "/matching/projects"

  return (
    <main className="flex h-full min-h-screen w-full flex-col">
      <Header activePathname={activePathname} />
      <div className="flex w-full flex-1">
        <SideBar activePathname={activePathname} />
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="min-h-[800px] px-4 pt-6">
            <MatchingSegmentRegion activePathname={activePathname} />
            <div className="flex min-w-0 flex-1 flex-col pt-6 pb-20">
              <MatchingProjectsListPage useMockData />
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
