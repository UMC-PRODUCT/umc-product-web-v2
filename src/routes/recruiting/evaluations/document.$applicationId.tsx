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
      key={applicationId}
      stage="document"
      applicationId={applicationId}
    />
  )
}
