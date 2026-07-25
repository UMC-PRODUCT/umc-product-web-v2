import { createFileRoute } from "@tanstack/react-router"

import { ApplicationEvaluationDetailPage } from "@/features/recruiting"

export const Route = createFileRoute(
  "/recruiting/evaluations/document/$applicationId",
)({
  validateSearch: (search: Record<string, unknown>) => ({
    roundId: typeof search.roundId === "string" ? search.roundId : "",
  }),
  component: DocumentEvaluationDetailRoute,
})

function DocumentEvaluationDetailRoute() {
  const { applicationId } = Route.useParams()
  const { roundId } = Route.useSearch()
  return (
    <ApplicationEvaluationDetailPage
      key={applicationId}
      stage="document"
      applicationId={applicationId}
      roundId={roundId}
    />
  )
}
