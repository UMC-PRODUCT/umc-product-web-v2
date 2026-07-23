import { createFileRoute } from "@tanstack/react-router"

import { ChapterManagePage } from "@/features/chapter/ui/ChapterManagePage"

export const Route = createFileRoute("/manage/chapter")({
  component: ChapterManagePage,
})
