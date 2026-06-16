import { useState } from "react"

import { useMe } from "@/features/auth/hooks/useMe"
import ProfileIcon from "@/shared/assets/icon/people/ProfileIcon"
import { cn } from "@/shared/lib/utils"

import { ProfileDropdown } from "./ProfileDropdown"

interface ProfileProps {
  size?: number
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
      {profileSrc ? (
        <img
          src={profileSrc}
          alt={me?.name ?? "profile"}
          className="size-full object-cover"
        />
      ) : (
        <ProfileIcon className="size-full" />
      )}
    </ProfileDropdown>
  )
}
