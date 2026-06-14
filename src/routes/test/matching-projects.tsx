import { createFileRoute } from "@tanstack/react-router"

import Header from "@/components/header/Header"
import { MatchingSegmentRegion } from "@/components/sidebar/MatchingSegmentRegion"
import SideBar from "@/components/sidebar/SideBar"
import { MatchingProjectsListPage } from "@/features/project/list"

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
          <div className="bp2:px-9.5 bp2:pt-12 min-h-[800px] px-4 pt-6">
            <MatchingSegmentRegion activePathname={activePathname} />
            <div className="bp2:pt-8 flex min-w-0 flex-1 flex-col pt-6 pb-20">
              <MatchingProjectsListPage useMockData />
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
