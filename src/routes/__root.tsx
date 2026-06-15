import {
  createRootRouteWithContext,
  HeadContent,
  Outlet,
} from "@tanstack/react-router"

import { ToastProvider } from "@/components/toast/ToastProvider"
import { NotFoundPage } from "@/features/error/ui/NotFoundPage"
import { RootErrorComponent } from "@/features/error/ui/RootErrorComponent"

import type { QueryClient } from "@tanstack/react-query"

interface RouterContext {
  queryClient: QueryClient
}

const DEFAULT_DESCRIPTION =
  "UMC 데모데이 팀 매칭 시스템 — 프로젝트 등록·조회부터 지원 폼 제출, 실시간 매칭 결과 확인까지 한 곳에서."

export const Route = createRootRouteWithContext<RouterContext>()({
  head: () => ({
    meta: [
      { title: "UMC | 데모데이 팀 매칭 시스템" },
      { name: "description", content: DEFAULT_DESCRIPTION },
    ],
  }),
  component: RootComponent,
  notFoundComponent: NotFoundPage,
  errorComponent: RootErrorComponent,
})

function RootComponent() {
  return (
    <div className="bg-teal-gray-50 h-full min-h-screen max-w-full min-w-fit">
      <HeadContent />
      <Outlet />
      <ToastProvider />
    </div>
  )
}
