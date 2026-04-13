import { createRootRouteWithContext, Outlet } from "@tanstack/react-router"

import type { QueryClient } from "@tanstack/react-query"

interface RouterContext {
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootComponent,
})

function RootComponent() {
  return (
    <div className="bg-teal-gray-50 h-screen max-w-full min-w-fit">
      <Outlet />
    </div>
  )
}
