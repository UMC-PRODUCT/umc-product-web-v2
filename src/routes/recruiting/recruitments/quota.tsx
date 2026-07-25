import { createFileRoute } from "@tanstack/react-router"

import { RecruitmentQuotaPage } from "@/features/recruiting"

export const Route = createFileRoute("/recruiting/recruitments/quota")({
  component: RecruitmentQuotaPage,
})
