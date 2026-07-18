import { createFileRoute } from "@tanstack/react-router"

import {
  ApplicantListPage,
  EVALUATION_STAGES,
  type EvaluationStage,
  isRecruitingListRole,
  type RecruitingListRole,
} from "@/features/recruiting"
import Footer from "@/widgets/footer/Footer"
import Header from "@/widgets/navigation/header/Header"
import RecruitingSideBar from "@/widgets/navigation/sidebar/RecruitingSideBar"

function parseStage(value: unknown): EvaluationStage {
  return EVALUATION_STAGES.find((stage) => stage === value) ?? "document"
}

function parseRole(value: unknown): RecruitingListRole {
  return isRecruitingListRole(value) ? value : "central"
}

export const Route = createFileRoute("/test/recruiting-applicants")({
  validateSearch: (search: Record<string, unknown>) => ({
    empty: search.empty === true || search.empty === "true",
    noRecruitment:
      search.noRecruitment === true || search.noRecruitment === "true",
    stage: parseStage(search.stage),
    role: parseRole(search.role),
  }),
  component: RecruitingApplicantsTestPage,
})

function RecruitingApplicantsTestPage() {
  const { empty, noRecruitment, stage, role } = Route.useSearch()
  const activePathname = `/recruiting/evaluations/${stage}`

  return (
    <main className="flex h-full min-h-screen w-full flex-col">
      <Header activePathname={activePathname} />
      <div className="flex w-full flex-1">
        <RecruitingSideBar activePathname={activePathname} />
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="min-h-200 px-8 pt-10 pb-20">
            <ApplicantListPage
              stage={stage}
              role={role}
              useMockData={!empty && !noRecruitment}
              hasRecruitment={!noRecruitment}
            />
          </div>
        </div>
      </div>
      <Footer />
    </main>
  )
}
