import { createFileRoute } from "@tanstack/react-router"

import { CurriculumManagePage } from "@/features/curriculum/ui/CurriculumManagePage"

export const Route = createFileRoute("/manage/curriculum/")({
  component: CurriculumManagePage,
})
