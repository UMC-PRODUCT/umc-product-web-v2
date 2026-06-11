import "./app.css"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import { createRouter, RouterProvider } from "@tanstack/react-router"
import { StrictMode } from "react"
import ReactDOM from "react-dom/client"

import { ServiceUnavailablePage } from "@/features/error/ui/ServiceUnavailablePage"

import { routeTree } from "./routeTree.gen"

const isMaintenance = import.meta.env.VITE_MAINTENANCE === "true"

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 0,
      retry: 1,
    },
  },
})

const router = createRouter({
  routeTree,
  context: { queryClient },
  defaultPreload: "intent",
  trailingSlash: "never",
})

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router
  }
}

const rootElement = document.getElementById("root")!

if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement)
  root.render(
    <StrictMode>
      {isMaintenance ? (
        <ServiceUnavailablePage />
      ) : (
        <QueryClientProvider client={queryClient}>
          <RouterProvider router={router} />
          <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
      )}
    </StrictMode>,
  )
}
