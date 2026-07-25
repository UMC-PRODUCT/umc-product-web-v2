import { createFileRoute } from "@tanstack/react-router"

import { ApplicationEvaluationDetailPage } from "@/features/recruiting"

export const Route = createFileRoute(
  "/recruiting/evaluations/interview/$applicationId",
)({
  validateSearch: (search: Record<string, unknown>) => ({
    roundId: typeof search.roundId === "string" ? search.roundId : "",
  }),
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
