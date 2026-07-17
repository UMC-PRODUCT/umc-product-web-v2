import { createFileRoute } from "@tanstack/react-router"

import { ApplicantListPage } from "@/features/recruiting"

export const Route = createFileRoute("/recruiting/evaluations/interview")({
  component: InterviewEvaluationListPage,
})

function InterviewEvaluationListPage() {
  return <ApplicantListPage stage="interview" />
}
