import { createFileRoute, Outlet, useMatchRoute } from "@tanstack/react-router"

import { ApplicantListPage } from "@/features/recruiting"

export const Route = createFileRoute("/recruiting/evaluations/interview")({
  component: InterviewEvaluationListPage,
})

function InterviewEvaluationListPage() {
  const matchRoute = useMatchRoute()
  const isDetail = Boolean(
    matchRoute({ to: "/recruiting/evaluations/interview/$applicationId" }),
  )
  if (isDetail) return <Outlet />
  return <ApplicantListPage stage="interview" />
}
