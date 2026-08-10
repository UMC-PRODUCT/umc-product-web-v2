import { createFileRoute, Outlet, useMatchRoute } from "@tanstack/react-router"

import { ApplicantListPage } from "@/features/recruiting"

export const Route = createFileRoute("/recruiting/evaluations/document")({
  component: DocumentEvaluationListPage,
})

function DocumentEvaluationListPage() {
  const matchRoute = useMatchRoute()
  const isDetail = Boolean(
    matchRoute({ to: "/recruiting/evaluations/document/$applicationId" }),
  )
  if (isDetail) return <Outlet />
  return <ApplicantListPage stage="document" />
}
