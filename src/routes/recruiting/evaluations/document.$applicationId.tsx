import { createFileRoute } from "@tanstack/react-router"

import {
  ApplicationEvaluationDetailPage,
  validateEvaluationDetailSearch,
} from "@/features/recruiting"

export const Route = createFileRoute(
  "/recruiting/evaluations/document/$applicationId",
)({
  validateSearch: validateEvaluationDetailSearch,
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
