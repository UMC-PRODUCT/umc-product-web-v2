import { createFileRoute } from "@tanstack/react-router"

import { GisuManagePage } from "@/features/gisu/ui/GisuManagePage"

export const Route = createFileRoute("/manage/gisu")({
  component: GisuManagePage,
})
