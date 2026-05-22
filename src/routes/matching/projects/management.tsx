import { createFileRoute, redirect } from "@tanstack/react-router"

import { ensureMe } from "@/features/auth/lib/ensureMe"
import { isCurrentTermPm, isOperator } from "@/features/auth/model/identity"
import { ProjectManagementPage } from "@/features/project/management"

export const Route = createFileRoute("/matching/projects/management")({
  beforeLoad: async ({ context }) => {
    const me = await ensureMe(context.queryClient)
    if (!isOperator(me) && !isCurrentTermPm(me)) throw redirect({ to: "/" })
  },
  component: ProjectManagementPage,
})
