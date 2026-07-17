import { createFileRoute } from "@tanstack/react-router"

import {
  ApplicantListPage,
  EVALUATION_STAGES,
  type EvaluationStage,
} from "@/features/recruiting"
import Footer from "@/widgets/footer/Footer"
import Header from "@/widgets/navigation/header/Header"
import RecruitingSideBar from "@/widgets/navigation/sidebar/RecruitingSideBar"

function parseStage(value: unknown): EvaluationStage {
  return EVALUATION_STAGES.find((stage) => stage === value) ?? "document"
}

export const Route = createFileRoute("/test/recruiting-applicants")({
  validateSearch: (search: Record<string, unknown>) => ({
    empty: search.empty === true || search.empty === "true",
    stage: parseStage(search.stage),
  }),
  component: RecruitingApplicantsTestPage,
})

function RecruitingApplicantsTestPage() {
  const { empty, stage } = Route.useSearch()
  const activePathname = `/recruiting/evaluations/${stage}`

  return (
    <main className="flex h-full min-h-screen w-full flex-col">
      <Header activePathname={activePathname} />
      <div className="flex w-full flex-1">
        <RecruitingSideBar activePathname={activePathname} />
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="min-h-200 px-8 pt-10 pb-20">
            <ApplicantListPage stage={stage} useMockData={!empty} />
          </div>
        </div>
      </div>
      <Footer />
    </main>
  )
}
