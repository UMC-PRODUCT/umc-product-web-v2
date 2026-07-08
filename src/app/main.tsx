import "./app.css"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import { createRouter, RouterProvider } from "@tanstack/react-router"
import { StrictMode } from "react"
import ReactDOM from "react-dom/client"

import { ServiceUnavailablePage } from "@/features/error/ui/ServiceUnavailablePage"

import { routeTree } from "../routeTree.gen"
import { wireAuthBridge } from "./authWiring"

// axios 인터셉터가 첫 요청을 보내기 전에 인증 브릿지 구현을 주입한다.
wireAuthBridge()

const isMaintenance = import.meta.env.VITE_MAINTENANCE === "true"

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 30, // 30초
      retry: 1,
      refetchOnMount: true, // 데이터가 stale할 때만 마운트 시 리페치 수행
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
