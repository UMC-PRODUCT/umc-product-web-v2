import { createFileRoute } from "@tanstack/react-router"

import { RecruitmentNoticePage } from "@/features/recruiting"

export const Route = createFileRoute("/projects/notice")({
  component: RecruitmentNoticePage,
})
