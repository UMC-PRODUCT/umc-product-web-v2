import { Link, useLocation } from "@tanstack/react-router"
import { useEffect, useState } from "react"

import { useMe } from "@/entities/member/hooks/useMe"
import {
  isCentralAdmin,
  isRecruitingOperator,
} from "@/entities/member/model/identity"
import { useAuthStore } from "@/entities/member/store/authStore"
import { useHeaderRecruitingStatus } from "@/features/recruiting/hooks/useHeaderRecruitingStatus"
import CloseIcon from "@/shared/assets/icon/close/CloseIcon"
import HamburgerIcon from "@/shared/assets/icon/hamburger/HamburgerIcon"
import UmcLogo from "@/shared/assets/icon/logo/UmcLogo"
import { getDisabledNavMessage } from "@/shared/config/headerNavPolicy"
import { SETTINGS_ENTRY_PATH } from "@/shared/config/settingsNavigation"
import { useIsWithinHeaderRecruitingWindow } from "@/shared/hooks/useHeaderRecruitingWindow"
import { cn } from "@/shared/lib/utils"
import { GlassRim } from "@/shared/ui/GlassRim"
import { useToastStore } from "@/shared/ui/toast/useToastStore"
import { GuestProfileButton } from "@/widgets/navigation/header/GuestProfileButton"
import HeaderButton from "@/widgets/navigation/header/HeaderButton"
import {
  GLASS_RIM_PILL,
  HEADER_TONE,
  type HeaderTone,
} from "@/widgets/navigation/header/headerTone"
import { MobileMenuPanel } from "@/widgets/navigation/header/MobileMenuPanel"
import NavigationButton from "@/widgets/navigation/header/NavigationButton"
import Profile from "@/widgets/navigation/header/Profile"
import {
  buildRecruitingNavItems,
  isNavActive,
  type NavItem,
} from "@/widgets/navigation/header/recruitingHeaderNav"
import {
  type RecruitingStatus,
  RecruitingStatusButton,
} from "@/widgets/navigation/header/RecruitingStatusButton"

interface RecruitingHeaderProps {
  // 모집 상태(진행 전/중/마감 + D-day). 서버에서 내려줄 예정
  // 없으면 상태 버튼을 렌더하지 않는다(연동 전 고정값 노출 방지)
  recruitingStatus?: RecruitingStatus
  activePathname?: string
  /** 소개 랜딩처럼 어두운 배경 위에 얹을 때 `glass` 를 쓴다. */
  tone?: HeaderTone
}

export default function RecruitingHeader({
  recruitingStatus,
  activePathname,
  tone = "light",
}: RecruitingHeaderProps) {
  const toneClass = HEADER_TONE[tone]
  const isGlass = tone === "glass"
  const location = useLocation()
  const pathname = activePathname ?? location.pathname
  const { data: me } = useMe()
  const isAuthed = useAuthStore((s) => s.isAuthed)
  // 모집 상태는 공개 API 라 게스트도 받는다. prop 으로 받은 값이 우선.
  const resolvedStatus = useHeaderRecruitingStatus()
  const status = recruitingStatus ?? resolvedStatus

  const showRecruiting = isRecruitingOperator(me)
  const showSettings = isCentralAdmin(me)
  // 탭 구성도 `지원하기` 와 같은 기준을 쓴다. 둘이 갈리면 모집 중이라며 지원
  // 버튼을 띄운 헤더에 데모데이 매칭 탭이 함께 남는다.
  const isRecruitingPeriod = useIsWithinHeaderRecruitingWindow()

  const addToast = useToastStore((s) => s.addToast)

  // 햄버거는 소개 랜딩(유리 톤)에서만 쓴다. 앱 안쪽 화면은 1440 고정 폭이라
  // 좁은 화면을 위한 메뉴가 필요 없다.
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  // 메뉴에서 다른 화면으로 넘어가면 판이 남아 있으면 안 된다.
  useEffect(() => setIsMenuOpen(false), [pathname])
  // 창을 1024 이상으로 넓히면 판은 lg:hidden 으로 사라지지만 열린 상태는 그대로
  // 남는다. 그러면 스크롤 잠금이 풀리지 않아 페이지가 굳는다.
  useEffect(() => {
    const wide = window.matchMedia("(min-width: 64rem)")
    const sync = () => {
      if (wide.matches) setIsMenuOpen(false)
    }
    sync()
    wide.addEventListener("change", sync)
    return () => wide.removeEventListener("change", sync)
  }, [])

  // 비활성 탭은 Link 가 아니라 버튼으로 그려진다. 핸들러를 안 주면 눌러도
  // 아무 일도 일어나지 않아 고장 난 것처럼 보인다. 아직 없는 화면이라는 안내는
  // 실패가 아니므로 에러(red)가 아닌 공지(notice)로 띄운다.
  const notifyComingSoon = (item: NavItem) => {
    addToast({
      message: getDisabledNavMessage(item),
      color: "primary",
      variant: "deep",
      type: "notice",
      duration: 3000,
    })
  }

  const navItems = buildRecruitingNavItems({
    isAuthed,
    showRecruiting,
    showSettings,
    settingsEntryPath: SETTINGS_ENTRY_PATH,
    isRecruitingPeriod,
  })

  return (
    <header
      className={cn(
        "relative z-50 flex h-20 min-h-20 w-full items-center justify-between overflow-visible",
        toneClass.root,
      )}
    >
      <Link
        to="/"
        className={cn(
          "flex items-center",
          isGlass ? "pl-8 md:w-55 md:pl-10" : "w-55 pl-10",
        )}
      >
        <UmcLogo className={cn("h-5.5 w-17.5", toneClass.logo)} />
      </Link>

      {/* 탭 묶음은 화면 정중앙에 고정한다. 흐름에 두면 좌우 블록 폭에 따라
          위치가 밀려, 화면을 옮길 때마다 탭이 좌우로 튄다. 시안도 좌우 슬롯을
          같은 폭으로 잡아 가운데에 둔다. */}
      <nav
        className={cn(
          "absolute left-1/2 flex shrink-0 -translate-x-1/2 items-center gap-1.5 rounded-full p-1.5",
          toneClass.nav,
          // 좁은 화면은 탭 대신 햄버거를 쓴다. 768 은 탭을 두되 메뉴를 열면
          // 같은 항목이 두 번 보이지 않게 감춘다.
          isGlass && (isMenuOpen ? "hidden lg:flex" : "hidden md:flex"),
        )}
      >
        {/* 알약이라 코너 반지름은 높이의 절반이다. rounded-full 의 999 를 그대로
            넘기면 코너 페이드가 요소보다 커져 테두리가 통째로 지워진다.
            시안의 알약은 코너 하이라이트 없이 상·하가 고르다. */}
        {isGlass && <GlassRim radius={24} variant="pill" {...GLASS_RIM_PILL} />}
        {navItems.map((item) => (
          <NavigationButton
            key={item.label}
            label={item.label}
            to={item.to}
            selected={isNavActive(pathname, item)}
            disabled={item.disabled}
            onClick={item.disabled ? () => notifyComingSoon(item) : undefined}
            className="min-w-18 px-4.5"
            tone={tone}
          />
        ))}
      </nav>

      {/* 비로그인은 `로그인` 버튼, 로그인 사용자는 프로필. 디자인이 권한별
          헤더 스펙에서 이 둘을 명시적으로 갈라 놓았다.

          유리 톤(소개 랜딩)은 구성이 다르다. 시안에 문의사항이 없고, 지원하기는
          항상 두되 로그인은 모집 기간에만 뺀다. 모집 중에는 지원으로 시선을
          몰고, 그 밖에는 로그인 진입로를 같이 연다. */}
      <div
        className={cn(
          "flex items-center justify-end gap-4",
          isGlass ? "pr-5.5 md:pr-8.5" : "pr-8.5",
        )}
      >
        {isGlass ? (
          <>
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
              <RecruitingStatusButton tone={tone} alwaysVisible />
              {!isRecruitingPeriod && !isAuthed && (
                <GuestProfileButton
                  recruitingStatus={status}
                  className="bg-transparent text-white hover:bg-transparent hover:text-white/80"
                />
              )}
              {isAuthed && <Profile />}
            </div>
          </>
        ) : (
          <>
            <RecruitingStatusButton tone={tone} />
            <HeaderButton
              label="문의사항"
              type="trailing-icon"
              className={cn("h-10", toneClass.inquiry)}
            />
            {isAuthed ? (
              <Profile />
            ) : (
              <GuestProfileButton recruitingStatus={status} />
            )}
          </>
        )}
      </div>

      {isGlass && isMenuOpen && (
        <MobileMenuPanel
          items={navItems}
          pathname={pathname}
          showLogin={!isRecruitingPeriod && !isAuthed}
          onClose={() => setIsMenuOpen(false)}
          onDisabledNav={notifyComingSoon}
        />
      )}
    </header>
  )
}
