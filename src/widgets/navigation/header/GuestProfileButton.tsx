import { Link } from "@tanstack/react-router"

import ProfileIcon from "@/shared/assets/icon/people/ProfileIcon"
import { cn } from "@/shared/lib/utils"

interface GuestProfileButtonProps {
  size?: number
  className?: string
}

/**
 * 비로그인 방문자의 프로필 자리.
 *
 * 로그인한 사용자와 같은 자리에 같은 아이콘을 두고, 누르면 로그인으로 보낸다.
 * 자리를 비우거나 버튼 문구로 바꾸면 로그인 전후로 헤더가 흔들린다.
 */
export function GuestProfileButton({
  size = 40,
  className,
}: GuestProfileButtonProps) {
  return (
    <Link
      to="/login"
      aria-label="로그인"
      className={cn(
        "shrink-0 overflow-hidden rounded-full transition-opacity hover:opacity-80",
        className,
      )}
      style={{ width: size, height: size }}
    >
      <ProfileIcon className="size-full" />
    </Link>
  )
}
