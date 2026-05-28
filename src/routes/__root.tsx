import { createRootRouteWithContext, Outlet } from "@tanstack/react-router"

import { ToastProvider } from "@/components/toast/ToastProvider"
import { NotFoundPage } from "@/features/error/ui/NotFoundPage"
import { ServerErrorPage } from "@/features/error/ui/ServerErrorPage"

import type { QueryClient } from "@tanstack/react-query"

interface RouterContext {
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootComponent,
  notFoundComponent: NotFoundPage,
  errorComponent: ServerErrorPage,
})

function RootComponent() {
  return (
    <div className="bg-teal-gray-50 h-full min-h-screen max-w-full min-w-fit pb-12">
      <Outlet />
      <ToastProvider />
    </div>
  )
}
