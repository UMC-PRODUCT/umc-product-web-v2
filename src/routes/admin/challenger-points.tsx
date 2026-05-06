import { createFileRoute } from "@tanstack/react-router"

import { GrantPointsPage } from "@/features/challenger"

export const Route = createFileRoute("/admin/challenger-points")({
  component: GrantPointsPage,
})
