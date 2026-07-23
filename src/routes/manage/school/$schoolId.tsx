import { createFileRoute } from "@tanstack/react-router"

import { SchoolRegistrationPage } from "@/features/settings/ui/SchoolRegistrationPage"

export const Route = createFileRoute("/manage/school/$schoolId")({
  component: SchoolEditRoute,
})

function SchoolEditRoute() {
  const { schoolId } = Route.useParams()
  return <SchoolRegistrationPage mode="edit" schoolId={schoolId} />
}
