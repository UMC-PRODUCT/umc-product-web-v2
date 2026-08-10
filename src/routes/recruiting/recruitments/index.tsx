import { createFileRoute } from "@tanstack/react-router"

import { RecruitmentListPage } from "@/features/recruiting"

export const Route = createFileRoute("/recruiting/recruitments/")({
  component: RecruitmentListPage,
})
