import { createFileRoute } from "@tanstack/react-router"

import { RecruitmentRoundEditPage } from "@/features/recruiting"

interface RecruitmentEditSearch {
  seasonId: string
}

export const Route = createFileRoute("/recruiting/recruitments/edit/$roundId")({
  validateSearch: (search: Record<string, unknown>): RecruitmentEditSearch => ({
    seasonId: typeof search.seasonId === "string" ? search.seasonId : "",
  }),
  component: RouteComponent,
})

function RouteComponent() {
  const { roundId } = Route.useParams()
  const { seasonId } = Route.useSearch()
  return <RecruitmentRoundEditPage seasonId={seasonId} roundId={roundId} />
}
