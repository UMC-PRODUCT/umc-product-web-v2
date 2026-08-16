import {
  createRootRouteWithContext,
  HeadContent,
  Outlet,
  useRouterState,
} from "@tanstack/react-router"

import { NotFoundPage } from "@/features/error/ui/NotFoundPage"
import { RootErrorComponent } from "@/features/error/ui/RootErrorComponent"
import { AnalyticsProvider } from "@/shared/analytics"
import { useIsDesktopWidth } from "@/shared/hooks/useIsDesktopWidth"
import { cn } from "@/shared/lib/utils"
import { DesktopOnlyOverlay } from "@/shared/ui/DesktopOnlyOverlay"
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

// 화면이 없는 경유 라우트다. 토큰 교환 후 곧바로 리다이렉트하므로 여기에 안내를
// 덮으면 로그인이 콜백 단계에서 멈춘 것처럼 보인다.
const OVERLAY_EXEMPT_PREFIXES = ["/oauth"]

function RootComponent() {
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const normalized = pathname.replace(/\/$/, "")
  const isResponsive = RESPONSIVE_PATHS.includes(normalized)
  const isOverlayExempt = OVERLAY_EXEMPT_PREFIXES.some(
    (prefix) => normalized === prefix || normalized.startsWith(`${prefix}/`),
  )
  const isDesktop = useIsDesktopWidth()
  const showOverlay = !isResponsive && !isOverlayExempt && !isDesktop

  return (
    <>
      <HeadContent />
      <AnalyticsProvider />
      {/*
        안내가 뜰 때 본문을 통째로 걷어낸다. display:none 으로 감추기만 하면
        라우트는 마운트된 채라 안내만 보이는 동안에도 그 아래 화면의 요청이
        그대로 나간다. 인증이 필요한 화면이면 401 갱신까지 따라붙는다.

        Outlet 만 빼도 안 된다. min-w-[1440px] 을 건 이 div 가 남아 문서 폭이
        1440 으로 굳고, 모바일 브라우저가 거기에 맞춰 레이아웃 뷰포트를 넓혀
        position:fixed 인 안내까지 1440 으로 그려진다. 폭을 만드는 주체가
        사라져야 한다.
      */}
      {!showOverlay && (
        <div
          className={cn(
            "bg-teal-gray-50 h-full min-h-screen",
            !isResponsive && "min-w-[1440px]",
          )}
        >
          <Outlet />
        </div>
      )}
      {showOverlay && <DesktopOnlyOverlay />}
      {/* 안내 위에서도 토스트가 떠야 하므로 숨김 대상 밖에 둔다. */}
      <ToastProvider />
    </>
  )
}
