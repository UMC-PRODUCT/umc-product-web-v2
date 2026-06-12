import { createFileRoute, redirect } from "@tanstack/react-router"

import { ensureMe } from "@/features/auth/lib/ensureMe"
import { canManageProjects } from "@/features/auth/model/identity"
import { ProjectManagementPage } from "@/features/project/management"
import { useViewModeStore } from "@/shared/view-mode"
import { projectViewMe } from "@/shared/view-mode/projectViewMe"

export const Route = createFileRoute("/matching/projects/management")({
  beforeLoad: async ({ context }) => {
    const me = await ensureMe(context.queryClient)
    const viewMe = projectViewMe(me, useViewModeStore.getState().mode)
    if (!canManageProjects(viewMe)) throw redirect({ to: "/matching/projects" })
  },
  component: ProjectManagementPage,
})
