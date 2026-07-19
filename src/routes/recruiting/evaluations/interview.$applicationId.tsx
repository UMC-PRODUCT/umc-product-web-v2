import { createFileRoute } from "@tanstack/react-router"

import { ApplicationEvaluationDetailPage } from "@/features/recruiting"

export const Route = createFileRoute(
  "/recruiting/evaluations/interview/$applicationId",
)({
  component: InterviewEvaluationDetailRoute,
})

function InterviewEvaluationDetailRoute() {
  const { applicationId } = Route.useParams()
  return (
    <ApplicationEvaluationDetailPage
      key={applicationId}
      stage="interview"
      applicationId={applicationId}
    />
  )
}
