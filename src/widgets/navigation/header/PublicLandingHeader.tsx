import { Link, useLocation } from "@tanstack/react-router"
import { useEffect, useState } from "react"

import CloseIcon from "@/shared/assets/icon/close/CloseIcon"
import HamburgerIcon from "@/shared/assets/icon/hamburger/HamburgerIcon"
import UmcLogo from "@/shared/assets/icon/logo/UmcLogo"
import {
  getDisabledNavMessage,
  HEADER_NAV_ITEMS,
  isHeaderNavItemActive,
} from "@/shared/config/headerNavPolicy"
import { useIsWithinHeaderRecruitingWindow } from "@/shared/hooks/useHeaderRecruitingWindow"
import {
  buildLoginRedirectSearch,
  getCurrentReturnTo,
} from "@/shared/lib/loginRedirect"
import { cn } from "@/shared/lib/utils"
import { GlassRim } from "@/shared/ui/GlassRim"
import { useToastStore } from "@/shared/ui/toast/useToastStore"

import { GLASS_RIM_PILL } from "./headerTone"
import { MobileMenuPanel } from "./MobileMenuPanel"
import NavigationButton from "./NavigationButton"
import { RecruitingStatusButton } from "./RecruitingStatusButton"

import type { NavItem } from "./recruitingHeaderNav"

const NAV_ITEMS: NavItem[] = HEADER_NAV_ITEMS

export default function PublicLandingHeader() {
  const { pathname } = useLocation()
  const isRecruitingPeriod = useIsWithinHeaderRecruitingWindow()
  const addToast = useToastStore((state) => state.addToast)
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  useEffect(() => setIsMenuOpen(false), [pathname])

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 64rem)")
    const sync = () => {
      if (mediaQuery.matches) setIsMenuOpen(false)
    }
    sync()
    mediaQuery.addEventListener("change", sync)
    return () => mediaQuery.removeEventListener("change", sync)
  }, [])

  const notifyComingSoon = (item: NavItem) => {
    addToast({
      message: getDisabledNavMessage(item),
      color: "primary",
      variant: "deep",
      type: "notice",
      duration: 3000,
    })
  }

  return (
    <header className="relative z-50 flex h-20 min-h-20 w-full items-center justify-between overflow-visible bg-transparent">
      <Link to="/" className="flex items-center pl-8 md:w-55 md:pl-10">
        <UmcLogo className="h-5.5 w-17.5 text-white" />
      </Link>

      <nav
        className={cn(
          "absolute left-1/2 hidden -translate-x-1/2 items-center gap-1.5 rounded-full bg-[rgba(251,252,252,0.2)] p-1.5",
          isMenuOpen ? "lg:flex" : "md:flex",
        )}
      >
        <GlassRim radius={24} variant="pill" {...GLASS_RIM_PILL} />
        {NAV_ITEMS.map((item) => (
          <NavigationButton
            key={item.label}
            label={item.label}
            to={item.to}
            selected={isHeaderNavItemActive(pathname, item)}
            disabled={item.disabled}
            onClick={item.disabled ? () => notifyComingSoon(item) : undefined}
            className="min-w-18 px-4.5"
            tone="glass"
          />
        ))}
      </nav>

      <div className="flex items-center justify-end gap-4 pr-5.5 md:pr-8.5">
        <button
          type="button"
          aria-expanded={isMenuOpen}
          aria-label={isMenuOpen ? "메뉴 닫기" : "메뉴 열기"}
          onClick={() => setIsMenuOpen((open) => !open)}
          className="flex size-11.5 cursor-pointer items-center justify-center text-white lg:hidden"
        >
          {isMenuOpen ? (
            <CloseIcon className="size-7.5" />
          ) : (
            <HamburgerIcon className="size-7.5" />
          )}
        </button>

        <div className="hidden items-center gap-4 lg:flex">
          <RecruitingStatusButton tone="glass" alwaysVisible />
          {!isRecruitingPeriod && (
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

      {isMenuOpen && (
        <MobileMenuPanel
          items={NAV_ITEMS}
          pathname={pathname}
          showLogin={!isRecruitingPeriod}
          onClose={() => setIsMenuOpen(false)}
          onDisabledNav={notifyComingSoon}
        />
      )}
    </header>
  )
}
