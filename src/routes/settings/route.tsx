import { createFileRoute, Outlet } from "@tanstack/react-router"

import Header from "@/components/header/Header"
import { ensureMe } from "@/features/auth/lib/ensureMe"

export const Route = createFileRoute("/settings")({
  beforeLoad: async ({ context }) => {
    await ensureMe(context.queryClient)
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
