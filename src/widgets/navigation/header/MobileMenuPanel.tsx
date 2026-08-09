import { Link } from "@tanstack/react-router"
import { useEffect } from "react"

import {
  buildLoginRedirectSearch,
  getCurrentReturnTo,
} from "@/shared/lib/loginRedirect"
import { cn } from "@/shared/lib/utils"

import { isNavActive, type NavItem } from "./recruitingHeaderNav"
import { RecruitingStatusButton } from "./RecruitingStatusButton"

const ITEM_CLASS =
  "text-subtitle-1-semibold flex items-center justify-center px-2.5 py-2 whitespace-nowrap transition-colors"

interface MobileMenuPanelProps {
  items: NavItem[]
  pathname: string
  /** 로그인 진입로를 메뉴에 둘지. 헤더 우측과 같은 기준을 쓴다. */
  showLogin: boolean
  onClose: () => void
  onDisabledNav: (item: NavItem) => void
}

/**
 * 1024 아래 소개 랜딩의 햄버거 메뉴.
 *
 * 시안은 헤더 바로 아래에 판을 깔고 그 아래를 딤드로 덮는다. 판 안쪽은 왼쪽에
 * 붙은 좁은 칸(95)이라 메뉴 글자 길이와 무관하게 폭이 고정이다.
 */
export function MobileMenuPanel({
  items,
  pathname,
  showLogin,
  onClose,
  onDisabledNav,
}: MobileMenuPanelProps) {
  // 열려 있는 동안 뒤 페이지가 스크롤되면 딤드만 남고 판이 화면 밖으로 나간다.
  useEffect(() => {
    const previous = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = previous
    }
  }, [])

  return (
    <div
      className="fixed inset-x-0 top-20 bottom-0 z-40 bg-[rgba(22,25,25,0.65)] lg:hidden"
      onClick={onClose}
    >
      {/* 판 자체를 눌렀을 때는 닫지 않는다. 딤드만 닫기 영역이다. */}
      <div
        className="bg-[#0d1a19] px-6.5 pt-4 pb-8"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex w-[95px] flex-col items-start gap-4">
          {/* 768 시안은 메뉴 사이를 조금 더 벌린다. */}
          <div className="flex flex-col items-start gap-2 md:gap-4">
            {items.map((item) => {
              const isActive = isNavActive(pathname, item)
              const className = cn(
                ITEM_CLASS,
                isActive
                  ? "text-teal-400"
                  : "text-teal-gray-400 hover:text-white",
              )

              if (item.disabled) {
                return (
                  <button
                    key={item.label}
                    type="button"
                    className={className}
                    onClick={() => onDisabledNav(item)}
                  >
                    {item.label}
                  </button>
                )
              }

              return (
                <Link
                  key={item.label}
                  to={item.to}
                  className={className}
                  onClick={onClose}
                >
                  {item.label}
                </Link>
              )
            })}

            {showLogin && (
              <Link
                to="/login"
                search={buildLoginRedirectSearch(getCurrentReturnTo())}
                className={cn(
                  ITEM_CLASS,
                  "text-teal-gray-400 hover:text-white",
                )}
                onClick={onClose}
              >
                로그인
              </Link>
            )}
          </div>

          <RecruitingStatusButton
            tone="glass"
            alwaysVisible
            className="w-full"
          />
        </div>
      </div>
    </div>
  )
}
