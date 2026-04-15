import { createFileRoute, Outlet } from "@tanstack/react-router"

import SideBar from "@/components/common/sidebar/SideBar"

export const Route = createFileRoute("/test/sidebar")({
  component: SideBarLayout,
})

function SideBarLayout() {
  return (
    <div className="flex min-h-screen w-full">
      <SideBar />
      <main className="flex-1 p-8">
        <Outlet />
      </main>
    </div>
  )
}
