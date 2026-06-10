import { createFileRoute, Outlet } from "@tanstack/react-router"

export const Route = createFileRoute("/matching/projects/announce")({
  component: AnnounceLayout,
})

function AnnounceLayout() {
  return <Outlet />
}
