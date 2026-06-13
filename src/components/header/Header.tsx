import { Link, useLocation } from "@tanstack/react-router"
import { useEffect, useState } from "react"

import { MobileSidebarDrawerContent } from "@/components/sidebar/MobileSidebarDrawerContent"
import { SideBarViewSwitcher } from "@/components/sidebar/SideBarViewSwitcher"
import { useToastStore } from "@/components/toast/useToastStore"
import CloseIcon from "@/shared/assets/icon/close/CloseIcon"
import HamburgerIcon from "@/shared/assets/icon/hamburger/HamburgerIcon"
import UmcLogo from "@/shared/assets/icon/logo/UmcLogo"
import { cn } from "@/shared/lib/utils"
import Profile from "@/shared/ui/Profile"

import HeaderButton from "./HeaderButton"
import NavigationButton from "./NavigationButton"

interface NavItem {
  label: string
  to: string
  disabled?: boolean
}

interface HeaderProps {
  activePathname?: string
}

export default function Header({ activePathname }: HeaderProps = {}) {
  const location = useLocation()
  const pathname = activePathname ?? location.pathname
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const addToast = useToastStore((s) => s.addToast)

  const navItems: NavItem[] = [
    { label: "소개", to: "/intro", disabled: true },
    { label: "데모데이 매칭", to: "/matching" },
    { label: "리크루팅", to: "/recruiting", disabled: true },
  ]

  const handleDisabledClick = (label: string) => {
    addToast({
      message: `${label} 서비스는 준비 중입니다. 더 나은 UMC 웹사이트로 찾아뵙겠습니다!`,
      color: "primary",
      variant: "deep",
      type: "notice",
      duration: 3000,
    })
  }

  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [pathname])

  useEffect(() => {
    if (!isMobileMenuOpen) return

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsMobileMenuOpen(false)
      }
    }

    window.addEventListener("keydown", handleEscape)
    return () => window.removeEventListener("keydown", handleEscape)
  }, [isMobileMenuOpen])

  return (
    <header className="bg-teal-gray-50 shadow-drop-neutral-3 relative z-50 flex min-h-16 w-full flex-col overflow-visible min-[960px]:h-20 min-[960px]:min-h-20 min-[960px]:flex-row min-[960px]:items-center min-[960px]:justify-between">
      <div className="flex h-16 w-full items-center justify-between min-[960px]:h-20">
        <Link
          to="/"
          className="flex w-36 items-center pl-10 xl:w-55"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <UmcLogo className="text-teal-gray-700 h-5.5 w-17.5" />
        </Link>

        <nav className="bg-teal-gray-50 border-teal-gray-100 hidden shrink-0 items-center gap-1 rounded-full border p-1 drop-shadow-[0_0_8px_rgba(10,86,80,0.04)] min-[960px]:flex xl:gap-1.5 xl:p-1.5">
          {navItems.map((item) => (
            <NavigationButton
              key={item.to}
              label={item.label}
              to={item.to}
              selected={pathname.startsWith(item.to)}
              disabled={item.disabled}
              onClick={
                item.disabled
                  ? () => handleDisabledClick(item.label)
                  : undefined
              }
              className="min-w-0 px-3 xl:min-w-18 xl:px-4.5"
            />
          ))}
        </nav>

        <div className="hidden items-center justify-end gap-2 pr-6 min-[960px]:flex min-[960px]:w-40 xl:w-55 xl:gap-4 xl:pr-8.5">
          <HeaderButton label="문의사항" type="trailing-icon" />
          <Profile />
        </div>

        <div className="flex min-w-0 items-center gap-2 pr-5 min-[960px]:hidden">
          <SideBarViewSwitcher
            className="relative z-[70] min-w-0"
            dropdownClassName="w-28 bp1:w-43"
            menuClassName="shadow-drop-neutral-2 absolute top-full right-0 z-[80] mt-1 w-full rounded-[8px]"
          />
          <button
            type="button"
            aria-label={isMobileMenuOpen ? "메뉴 닫기" : "메뉴 열기"}
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-header-navigation"
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
            className="border-teal-gray-100 text-teal-gray-700 hover:bg-teal-gray-100 flex size-9 items-center justify-center rounded-full border bg-white transition-colors"
          >
            {isMobileMenuOpen ? (
              <CloseIcon className="size-5" />
            ) : (
              <HamburgerIcon className="size-5" />
            )}
          </button>
        </div>
      </div>

      {isMobileMenuOpen && (
        <button
          type="button"
          aria-label="모바일 메뉴 닫기"
          className="fixed inset-x-0 top-16 bottom-0 z-40 bg-neutral-900/40 min-[960px]:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <nav
        id="mobile-header-navigation"
        className={cn(
          "border-teal-gray-100 bg-teal-gray-50 shadow-drop-neutral-3 absolute top-16 right-0 left-0 z-50 flex max-h-[calc(100dvh-64px)] w-full flex-col gap-4 overflow-y-auto border-t px-6 py-4 min-[960px]:hidden",
          !isMobileMenuOpen && "hidden",
        )}
      >
        <div className="flex items-center justify-end gap-2">
          <HeaderButton
            label="문의사항"
            type="trailing-icon"
            className="text-body-1-medium h-11"
          />
          <Profile size={36} />
        </div>

        <div className="grid grid-cols-2 gap-1">
          {navItems.map((item) => {
            const selected = pathname.startsWith(item.to)
            return (
              <NavigationButton
                key={item.to}
                label={item.label}
                to={item.to}
                selected={selected}
                disabled={item.disabled}
                className="text-body-1-medium h-11 w-full min-w-0 justify-center px-4"
                onClick={() => {
                  if (item.disabled) handleDisabledClick(item.label)
                  setIsMobileMenuOpen(false)
                }}
              />
            )
          })}
        </div>

        <MobileSidebarDrawerContent
          activePathname={pathname}
          onNavigate={() => setIsMobileMenuOpen(false)}
        />
      </nav>
    </header>
  )
}
