import { createFileRoute, Outlet, redirect } from "@tanstack/react-router"

import { ensureMe } from "@/features/auth/lib/ensureMe"
import { canAccessProjectSettings } from "@/features/auth/model/identity"

export const Route = createFileRoute("/matching/projects/announce")({
  beforeLoad: async ({ context }) => {
    const me = await ensureMe(context.queryClient)
    if (!canAccessProjectSettings(me)) {
      throw redirect({ to: "/matching/projects" })
    }
  },
  component: AnnounceLayout,
})

function AnnounceLayout() {
  return <Outlet />
}
