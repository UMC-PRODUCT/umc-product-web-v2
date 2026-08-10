import {
  createRootRouteWithContext,
  HeadContent,
  Outlet,
  useRouterState,
} from "@tanstack/react-router"

import { NotFoundPage } from "@/features/error/ui/NotFoundPage"
import { RootErrorComponent } from "@/features/error/ui/RootErrorComponent"
import { AnalyticsProvider } from "@/shared/analytics"
import { cn } from "@/shared/lib/utils"
import { ToastProvider } from "@/shared/ui/toast/ToastProvider"

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

// 앱 대부분은 데스크톱 전용으로 만들어져 좁은 화면에서 무너진다. 그래서 전역으로
// 최소 폭을 걸어 가로 스크롤을 감수한다. 랜딩만 반응형 시안이 있어 이 제약을
// 푼다. 여기서 걷어내지 않으면 좁은 화면에서도 문서 폭이 1440 으로 남아 미디어
// 쿼리는 걸려도 화면이 잘린다.
const RESPONSIVE_PATHS = ["/about", "/recruiting-guide"]

function RootComponent() {
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const isResponsive = RESPONSIVE_PATHS.includes(pathname.replace(/\/$/, ""))

  return (
    <div
      className={cn(
        "bg-teal-gray-50 h-full min-h-screen",
        !isResponsive && "min-w-[1440px]",
      )}
    >
      <HeadContent />
      <AnalyticsProvider />
      <Outlet />
      <ToastProvider />
    </div>
  )
}
