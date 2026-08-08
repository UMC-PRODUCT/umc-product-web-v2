import { Link, useLocation, useNavigate } from "@tanstack/react-router"
import { useEffect, useRef, useState } from "react"

import { useAuthStore } from "@/entities/member/store/authStore"
import UmcLogo from "@/shared/assets/icon/logo/UmcLogo"
import {
  getDisabledNavMessage,
  HEADER_NAV_ITEMS,
  type HeaderNavItem,
  isHeaderNavItemActive,
} from "@/shared/config/headerNavPolicy"
import {
  buildLoginRedirectSearch,
  getCurrentReturnTo,
} from "@/shared/lib/loginRedirect"
import { cn } from "@/shared/lib/utils"
import { useToastStore } from "@/shared/ui/toast/useToastStore"

import type { RecruitingStatus } from "@/shared/model/recruitingStatus"

/** 어두운 히어로 위에 얹히는 헤더라 우측 버튼도 밝은 배경을 쓸 수 없다. */
const SLOT_BUTTON_CLASS =
  "flex h-10 min-w-16 items-center justify-center rounded-[10px] px-5 text-center text-[16px] font-semibold tracking-[-0.32px] whitespace-nowrap transition-colors"

interface LandingHeaderProps {
  /**
   * 모집 상태. 라우트에서 넣어 준다.
   *
   * 여기서 직접 조회하지 않는 이유는 조회 훅이 리크루팅 기능에 있어서다.
   * 소개 화면이 그 훅을 바로 부르면 기능끼리 가로로 엮여 경계 검사에 걸린다.
   */
  recruitingStatus?: RecruitingStatus
}

export function LandingHeader({ recruitingStatus }: LandingHeaderProps) {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const isAuthed = useAuthStore((s) => s.isAuthed)
  const [isVisible, setIsVisible] = useState(true)
  const lastScrollY = useRef(0)
  const visibleRef = useRef(true)
  const tickingRef = useRef(false)
  const addToast = useToastStore((s) => s.addToast)

  const handleDisabledClick = (item: HeaderNavItem) => {
    addToast({
      message: getDisabledNavMessage(item),
      color: "primary",
      variant: "deep",
      type: "notice",
      duration: 3000,
    })
  }

  useEffect(() => {
    let rafId: number | null = null

    const handleScroll = () => {
      if (tickingRef.current) return
      tickingRef.current = true

      rafId = requestAnimationFrame(() => {
        const currentScrollY = window.scrollY
        const threshold = window.innerHeight
        const nextVisible =
          currentScrollY <= threshold || currentScrollY < lastScrollY.current

        if (visibleRef.current !== nextVisible) {
          visibleRef.current = nextVisible
          setIsVisible(nextVisible)
        }

        lastScrollY.current = currentScrollY
        tickingRef.current = false
      })
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => {
      window.removeEventListener("scroll", handleScroll)
      if (rafId !== null) cancelAnimationFrame(rafId)
      tickingRef.current = false
    }
  }, [])

  return (
    <header
      className={cn(
        "fixed top-0 left-0 z-1000 flex h-20 w-full items-center justify-center overflow-hidden transition-transform duration-500 ease-out",
        isVisible ? "translate-y-0" : "-translate-y-full",
      )}
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(16,33,31,0.92)_0%,rgba(22,35,34,0.72)_54%,rgba(15,26,25,0)_100%)]"
        style={{
          maskImage:
            "linear-gradient(90deg, transparent 0%, #000 7%, #000 93%, transparent 100%)",
          WebkitMaskImage:
            "linear-gradient(90deg, transparent 0%, #000 7%, #000 93%, transparent 100%)",
        }}
      />

      <div className="relative flex h-full w-full max-w-360 items-center justify-between">
        <div className="flex h-full w-55 items-center justify-start pl-12.5">
          <UmcLogo className="h-5.5 w-18.5 text-white" aria-label="UMC" />
        </div>

        <nav
          className="relative flex items-center justify-center gap-1.5 rounded-[9999px] p-1.5"
          style={{
            background: "rgba(33, 54, 51, 0.72)",
            boxShadow: "0 0 16px 0 rgba(10, 86, 80, 0.04)",
          }}
          aria-label="랜딩 페이지 내비게이션"
        >
          <div
            className="pointer-events-none absolute inset-0 rounded-[9999px]"
            style={{
              padding: "1px",
              background: `
              radial-gradient(circle at 0% 0%, rgba(255, 255, 255, 0.50), rgba(255, 255, 255, 0)),
              radial-gradient(circle at 100% 100%, rgba(255, 255, 255, 0.50), rgba(255, 255, 255, 0))
            `,
              mask: "linear-gradient(#fff 0 0) content-box exclude, linear-gradient(#fff 0 0)",
              WebkitMask:
                "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
              WebkitMaskComposite: "xor",
              maskComposite: "exclude",
            }}
          />
          {HEADER_NAV_ITEMS.map((item) => {
            const { label, to, disabled } = item
            const isActive = isHeaderNavItemActive(pathname, item)
            const className = cn(
              "flex h-9 min-w-18 items-center justify-center rounded-full px-4.5 py-1.5 text-center text-[16px] tracking-[-0.16px] whitespace-nowrap transition-colors",
              isActive
                ? "bg-[#e5f5f2] leading-normal font-semibold text-[#0b6b64]"
                : "leading-[1.45] font-medium text-[#e9ecec] hover:bg-white/10",
            )

            if (disabled) {
              return (
                <button
                  key={to}
                  type="button"
                  onClick={() => handleDisabledClick(item)}
                  className={className}
                >
                  {label}
                </button>
              )
            }

            return (
              <button
                key={to}
                type="button"
                onClick={() => void navigate({ to })}
                className={className}
              >
                {label}
              </button>
            )
          })}
        </nav>

        {/* 랜딩에서 지원 흐름으로 들어가는 유일한 진입로다. 비로그인 방문자가
            대부분이라 로그인 자리도 함께 둔다. */}
        <div className="flex h-full w-55 items-center justify-end gap-4 pr-12.5">
          {recruitingStatus?.phase === "open" && (
            <Link
              to="/projects/notice"
              className={cn(
                SLOT_BUTTON_CLASS,
                "border border-white/20 bg-white/15 text-white hover:bg-white/25",
              )}
            >
              지원하기
            </Link>
          )}
          {recruitingStatus?.phase === "closed" && !isAuthed && (
            <span
              className={cn(
                SLOT_BUTTON_CLASS,
                "border border-white/10 bg-white/5 font-medium text-white/50",
              )}
            >
              모집 마감
            </span>
          )}
          {!isAuthed && (
            <Link
              to="/login"
              search={buildLoginRedirectSearch(getCurrentReturnTo())}
              className="text-[16px] font-semibold tracking-[-0.32px] whitespace-nowrap text-white transition-colors hover:text-white/70"
            >
              로그인
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
