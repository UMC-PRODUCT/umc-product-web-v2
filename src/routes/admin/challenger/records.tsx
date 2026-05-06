import { createFileRoute } from "@tanstack/react-router"

import { RecordCodePage } from "@/features/challenger"

export const Route = createFileRoute("/admin/challenger/records")({
  component: RecordCodePage,
})
