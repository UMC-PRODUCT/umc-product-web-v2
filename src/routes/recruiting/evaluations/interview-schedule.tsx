import { createFileRoute, Outlet, useMatchRoute } from "@tanstack/react-router"

import { InterviewSchedulePage } from "@/features/recruiting"

export const Route = createFileRoute(
  "/recruiting/evaluations/interview-schedule",
)({
  component: InterviewScheduleListRoute,
})

function InterviewScheduleListRoute() {
  const matchRoute = useMatchRoute()
  const isBoard = Boolean(
    matchRoute({ to: "/recruiting/evaluations/interview-schedule/$roundId" }),
  )
  if (isBoard) return <Outlet />
  return <InterviewSchedulePage />
}
