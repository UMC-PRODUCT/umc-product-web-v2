import { createFileRoute } from "@tanstack/react-router"

import { ApplicantListPage } from "@/features/recruiting"

export const Route = createFileRoute("/recruiting/evaluations/document")({
  component: DocumentEvaluationListPage,
})

function DocumentEvaluationListPage() {
  return <ApplicantListPage stage="document" />
}
