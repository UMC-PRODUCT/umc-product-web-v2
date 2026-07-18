import { createFileRoute } from "@tanstack/react-router"

import { ApplicantListPage } from "@/features/recruiting"

export const Route = createFileRoute("/recruiting/evaluations/final")({
  component: FinalEvaluationListPage,
})

function FinalEvaluationListPage() {
  return <ApplicantListPage stage="final" />
}
