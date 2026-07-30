import { createFileRoute } from "@tanstack/react-router"

import { InterviewScheduleBoardPage } from "@/features/recruiting"

export const Route = createFileRoute(
  "/recruiting/evaluations/interview-schedule/$roundId",
)({
  component: InterviewScheduleBoardRoute,
})

function InterviewScheduleBoardRoute() {
  const { roundId } = Route.useParams()
  return <InterviewScheduleBoardPage key={roundId} roundId={roundId} />
}
