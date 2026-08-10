import { createFileRoute } from "@tanstack/react-router"

import { CurriculumEditPage } from "@/features/curriculum/ui/CurriculumEditPage"

interface CurriculumEditSearch {
  part?: string
  focusId?: string
}

export const Route = createFileRoute("/manage/curriculum/edit")({
  validateSearch: (search: Record<string, unknown>): CurriculumEditSearch => {
    return {
      part: typeof search.part === "string" ? search.part : undefined,
      focusId: typeof search.focusId === "string" ? search.focusId : undefined,
    }
  },
  component: CurriculumEditRouteComponent,
})

function CurriculumEditRouteComponent() {
  const { part, focusId } = Route.useSearch()
  return <CurriculumEditPage part={part} focusId={focusId} />
}
