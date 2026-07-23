import { createFileRoute } from "@tanstack/react-router"

import {
  isRecruitingListRole,
  type RecruitingListRole,
  RecruitmentListPage,
} from "@/features/recruiting"
import Footer from "@/widgets/footer/Footer"
import Header from "@/widgets/navigation/header/Header"
import RecruitingSideBar from "@/widgets/navigation/sidebar/RecruitingSideBar"

function parseRole(value: unknown): RecruitingListRole {
  return isRecruitingListRole(value) ? value : "schoolStaff"
}

export const Route = createFileRoute("/test/recruiting-recruitments")({
  validateSearch: (search: Record<string, unknown>) => ({
    role: parseRole(search.role),
    empty: search.empty === true || search.empty === "true",
  }),
  component: RecruitingRecruitmentsTestPage,
})

function RecruitingRecruitmentsTestPage() {
  const { role, empty } = Route.useSearch()
  const activePathname = "/recruiting/recruitments"

  return (
    <main className="flex h-full min-h-screen w-full flex-col">
      <Header activePathname={activePathname} />
      <div className="flex w-full flex-1">
        <RecruitingSideBar activePathname={activePathname} />
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="min-h-200 px-8 pt-10 pb-20">
            <RecruitmentListPage role={role} useMockData={!empty} />
          </div>
        </div>
      </div>
      <Footer />
    </main>
  )
}
