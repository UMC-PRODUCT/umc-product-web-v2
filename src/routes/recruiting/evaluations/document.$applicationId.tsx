import { createFileRoute } from "@tanstack/react-router"

import { ApplicationEvaluationDetailPage } from "@/features/recruiting"

export const Route = createFileRoute(
  "/recruiting/evaluations/document/$applicationId",
)({
  component: DocumentEvaluationDetailRoute,
})

function DocumentEvaluationDetailRoute() {
  const { applicationId } = Route.useParams()
  return (
    <ApplicationEvaluationDetailPage
      stage="document"
      applicationId={applicationId}
    />
  )
}
