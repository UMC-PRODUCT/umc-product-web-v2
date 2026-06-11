import { createFileRoute, redirect } from "@tanstack/react-router"

import { ensureMe } from "@/features/auth/lib/ensureMe"
import { canManageProjects } from "@/features/auth/model/identity"
import { ProjectManagementPage } from "@/features/project/management"

export const Route = createFileRoute("/matching/projects/management")({
  beforeLoad: async ({ context }) => {
    const me = await ensureMe(context.queryClient)
    if (!canManageProjects(me)) throw redirect({ to: "/matching/projects" })
  },
  component: ProjectManagementPage,
})
