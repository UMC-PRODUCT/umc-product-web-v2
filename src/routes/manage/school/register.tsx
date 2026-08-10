import { createFileRoute } from "@tanstack/react-router"

import { SchoolRegistrationPage } from "@/features/settings/ui/SchoolRegistrationPage"

export const Route = createFileRoute("/manage/school/register")({
  component: SchoolRegisterRoute,
})

function SchoolRegisterRoute() {
  return <SchoolRegistrationPage mode="register" />
}
