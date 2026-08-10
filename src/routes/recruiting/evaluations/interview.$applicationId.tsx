import { createFileRoute } from "@tanstack/react-router"

import {
  ApplicationEvaluationDetailPage,
  validateEvaluationDetailSearch,
} from "@/features/recruiting"

export const Route = createFileRoute(
  "/recruiting/evaluations/interview/$applicationId",
)({
  validateSearch: validateEvaluationDetailSearch,
  component: InterviewEvaluationDetailRoute,
})

function InterviewEvaluationDetailRoute() {
  const { applicationId } = Route.useParams()
  const { roundId } = Route.useSearch()
  return (
    <ApplicationEvaluationDetailPage
      key={applicationId}
      stage="interview"
      applicationId={applicationId}
      roundId={roundId}
    />
  )
}
