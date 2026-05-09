import { createFileRoute } from "@tanstack/react-router"

import { ProjectManagementPage } from "@/features/project/management"

export const Route = createFileRoute("/matching/projects/management")({
  component: ProjectManagementPage,
})
