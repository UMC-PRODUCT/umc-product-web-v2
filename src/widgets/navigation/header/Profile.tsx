import { useState } from "react"

import { useMe } from "@/entities/member/hooks/useMe"
import { cn } from "@/shared/lib/utils"
import {
  ProfileAvatar,
  type ProfileAvatarSize,
} from "@/shared/ui/profile/ProfileAvatar"

import { ProfileDropdown } from "./ProfileDropdown"

interface ProfileProps {
  size?: ProfileAvatarSize
  src?: string | null
  className?: string
}

export default function Profile({ size = 40, src, className }: ProfileProps) {
  const [isOpen, setIsOpen] = useState(false)
  const { data: me } = useMe()

  const profileSrc = src ?? me?.profileImageLink

  return (
    <ProfileDropdown
      open={isOpen}
      onOpenChange={setIsOpen}
      triggerClassName={cn(
        "shrink-0 overflow-hidden rounded-full transition-opacity hover:opacity-80",
        className,
      )}
      triggerStyle={{ width: size, height: size }}
    >
      <ProfileAvatar
        size={size}
        src={profileSrc}
        alt={me?.name ?? "프로필 이미지"}
      />
      <span className="sr-only">프로필 메뉴</span>
    </ProfileDropdown>
  )
}
