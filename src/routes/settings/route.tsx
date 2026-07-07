import { createFileRoute, Outlet } from "@tanstack/react-router"

import { ensureMe } from "@/features/auth/lib/ensureMe"
import Header from "@/widgets/navigation/header/Header"

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
