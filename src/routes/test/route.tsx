import { createFileRoute, Outlet, redirect } from "@tanstack/react-router"

export const Route = createFileRoute("/test")({
  beforeLoad: () => {
    if (!import.meta.env.DEV) {
      throw redirect({ to: "/" })
    }
  },
  component: TestRouteLayout,
})

function TestRouteLayout() {
  return <Outlet />
}
