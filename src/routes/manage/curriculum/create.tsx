import { createFileRoute } from "@tanstack/react-router"

import { CurriculumCreatePage } from "@/features/curriculum/ui/CurriculumCreatePage"

interface CurriculumCreateSearch {
  part?: string
}

export const Route = createFileRoute("/manage/curriculum/create")({
  validateSearch: (search: Record<string, unknown>): CurriculumCreateSearch => {
    return {
      part: typeof search.part === "string" ? search.part : undefined,
    }
  },
  component: CurriculumCreateRouteComponent,
})

function CurriculumCreateRouteComponent() {
  const { part } = Route.useSearch()
  return <CurriculumCreatePage part={part} />
}
