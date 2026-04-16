import { createRootRouteWithContext, Outlet } from "@tanstack/react-router"

import { ToastProvider } from "@/components/toast/ToastProvider"

import type { QueryClient } from "@tanstack/react-query"

interface RouterContext {
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootComponent,
})

function RootComponent() {
  return (
    <div className="bg-teal-gray-50 h-full min-h-screen max-w-full min-w-fit pb-12">
      <Outlet />
      <ToastProvider />
    </div>
  )
}
