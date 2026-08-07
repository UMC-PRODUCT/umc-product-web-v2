import { Link } from "@tanstack/react-router"

import { cn } from "@/shared/lib/utils"

import type { RecruitingStatus } from "@/shared/model/recruitingStatus"

interface GuestProfileButtonProps {
  recruitingStatus?: RecruitingStatus
  className?: string
}

/**
 * 비로그인 방문자의 헤더 우측 진입점.
 *
 * 권한별 헤더 스펙에서 비회원은 네 화면 모두 `로그인` 텍스트 버튼이다. 로그인한
 * 사용자만 프로필 자리를 갖는다.
 */
export function GuestProfileButton({
  recruitingStatus,
  className,
}: GuestProfileButtonProps) {
  const isClosed = recruitingStatus?.phase === "closed"

  return (
    <Link
      to="/login"
      className={cn(
        "text-label-1-semibold flex h-10 min-w-16 shrink-0 items-center justify-center rounded-[10px] px-5 text-center tracking-[-0.32px] transition-colors",
        isClosed
          ? "bg-teal-600 text-white hover:bg-teal-700"
          : "bg-teal-100 text-teal-600 hover:bg-teal-200",
        className,
      )}
    >
      로그인
    </Link>
  )
}
