import { Link, useLocation } from "@tanstack/react-router"

import { useMe } from "@/entities/member/hooks/useMe"
import {
  isCentralAdmin,
  isRecruitingOperator,
} from "@/entities/member/model/identity"
import { useAuthStore } from "@/entities/member/store/authStore"
import { useHeaderRecruitingStatus } from "@/features/recruiting/hooks/useHeaderRecruitingStatus"
import UmcLogo from "@/shared/assets/icon/logo/UmcLogo"
import { getDisabledNavMessage } from "@/shared/config/headerNavPolicy"
import { SETTINGS_ENTRY_PATH } from "@/shared/config/settingsNavigation"
import { useToastStore } from "@/shared/ui/toast/useToastStore"
import { GuestProfileButton } from "@/widgets/navigation/header/GuestProfileButton"
import HeaderButton from "@/widgets/navigation/header/HeaderButton"
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
}

export default function RecruitingHeader({
  recruitingStatus,
  activePathname,
}: RecruitingHeaderProps) {
  const location = useLocation()
  const pathname = activePathname ?? location.pathname
  const { data: me } = useMe()
  const isAuthed = useAuthStore((s) => s.isAuthed)
  // 모집 상태는 공개 API 라 게스트도 받는다. prop 으로 받은 값이 우선.
  const resolvedStatus = useHeaderRecruitingStatus()
  const status = recruitingStatus ?? resolvedStatus

  const showRecruiting = isRecruitingOperator(me)
  const showSettings = isCentralAdmin(me)
  // 상태를 아직 못 받았으면 감추지 않는다. 있던 탭이 잠깐 사라지는 것보다
  // 잠깐 더 보이는 편이 덜 어색하다.
  const isRecruitingPeriod = status?.phase === "open"

  const addToast = useToastStore((s) => s.addToast)

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
    <header className="bg-teal-gray-50 shadow-drop-neutral-3 relative z-50 flex h-20 min-h-20 w-full items-center justify-between overflow-visible">
      <Link to="/" className="flex w-55 items-center pl-10">
        <UmcLogo className="text-teal-gray-700 h-5.5 w-17.5" />
      </Link>

      <nav className="bg-teal-gray-50 border-teal-gray-100 flex shrink-0 items-center gap-1.5 rounded-full border p-1.5 drop-shadow-[0_0_8px_rgba(10,86,80,0.04)]">
        {navItems.map((item) => (
          <NavigationButton
            key={item.label}
            label={item.label}
            to={item.to}
            selected={isNavActive(pathname, item)}
            disabled={item.disabled}
            onClick={item.disabled ? () => notifyComingSoon(item) : undefined}
            className="min-w-18 px-4.5"
          />
        ))}
      </nav>

      {/* 비로그인은 `로그인` 버튼, 로그인 사용자는 프로필. 디자인이 권한별
          헤더 스펙에서 이 둘을 명시적으로 갈라 놓았다. */}
      <div className="flex items-center justify-end gap-4 pr-8.5">
        {status && (
          <RecruitingStatusButton status={status} isAuthed={isAuthed} />
        )}
        <HeaderButton
          label="문의사항"
          type="trailing-icon"
          className="border-teal-gray-150 h-10 border"
        />
        {isAuthed ? (
          <Profile />
        ) : (
          <GuestProfileButton recruitingStatus={status} />
        )}
      </div>
    </header>
  )
}
