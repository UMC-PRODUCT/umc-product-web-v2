import { createFileRoute } from "@tanstack/react-router"

import { RecruitmentCreatePage } from "@/features/recruiting"

export const Route = createFileRoute("/recruiting/recruitments/new")({
  component: RecruitmentCreatePage,
})
