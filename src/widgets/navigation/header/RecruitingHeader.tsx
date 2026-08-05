import { Link, useLocation } from "@tanstack/react-router"

import { useMe } from "@/entities/member/hooks/useMe"
import {
  isAnyOperator,
  isCentralStaff,
  isSuperAdmin,
} from "@/entities/member/model/identity"
import { useAuthStore } from "@/entities/member/store/authStore"
import UmcLogo from "@/shared/assets/icon/logo/UmcLogo"
import { SETTINGS_ENTRY_PATH } from "@/shared/config/settingsNavigation"
import HeaderButton from "@/widgets/navigation/header/HeaderButton"
import NavigationButton from "@/widgets/navigation/header/NavigationButton"
import Profile from "@/widgets/navigation/header/Profile"
import {
  buildRecruitingNavItems,
  isNavActive,
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

  const showRecruiting = isAnyOperator(me)
  const showSettings = isSuperAdmin(me) || isCentralStaff(me)

  const navItems = buildRecruitingNavItems({
    isAuthed,
    showRecruiting,
    showSettings,
    settingsEntryPath: SETTINGS_ENTRY_PATH,
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
            className="min-w-18 px-4.5"
          />
        ))}
      </nav>

      <div className="flex items-center justify-end gap-4 pr-8.5">
        {isAuthed ? (
          <>
            {recruitingStatus && (
              <RecruitingStatusButton status={recruitingStatus} />
            )}
            <HeaderButton
              label="문의사항"
              type="text"
              className="border-teal-gray-150 h-10 border"
            />
            <Profile />
          </>
        ) : (
          <>
            <HeaderButton
              label="문의사항"
              type="text"
              className="border-teal-gray-150 h-10 border"
            />
            {recruitingStatus && (
              <RecruitingStatusButton status={recruitingStatus} />
            )}
            <Link
              to="/login"
              className="text-label-1-semibold flex h-10 min-w-16 items-center justify-center rounded-[10px] bg-teal-100 px-5 text-center tracking-[-0.32px] text-teal-600"
            >
              로그인
            </Link>
          </>
        )}
      </div>
    </header>
  )
}
