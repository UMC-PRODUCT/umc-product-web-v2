import { createFileRoute } from "@tanstack/react-router"

import { EvaluatorAllocationPage } from "@/features/recruiting"

export const Route = createFileRoute("/recruiting/evaluations/")({
  component: EvaluatorAllocationPage,
})
