import { createFileRoute, Outlet } from "@tanstack/react-router"

import Header from "@/components/header/Header"
import { ensureMe } from "@/features/auth/lib/ensureMe"

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [{ name: "robots", content: "noindex, nofollow" }],
  }),
  beforeLoad: async ({ context, location }) => {
    await ensureMe(context.queryClient, location.href)
  },
  component: SettingsLayout,
})

function SettingsLayout() {
  return (
    <main className="h-full min-h-screen w-full">
      <Header />
      <Outlet />
    </main>
  )
}
