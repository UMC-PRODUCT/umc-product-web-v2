import ProfileIcon from "@/shared/assets/icon/people/ProfileIcon"
import { cn } from "@/shared/lib/utils"

export type ProfileAvatarSize = 40 | 46 | 100
export type ProfileAvatarState = "default" | "filled" | "hover-upload"

export interface ProfileAvatarProps {
  size?: ProfileAvatarSize
  src?: string | null
  alt?: string
  state?: ProfileAvatarState
  className?: string
}

export function ProfileAvatar({
  size = 40,
  src,
  alt = "프로필 이미지",
  state = src ? "filled" : "default",
  className,
}: ProfileAvatarProps) {
  const isDefault = state === "default"
  const isFilled = state === "filled"
  const isHoverUpload = state === "hover-upload"

  return (
    <span
      className={cn(
        "bg-teal-gray-200 relative inline-flex shrink-0 overflow-hidden rounded-full",
        (isFilled || isHoverUpload) && "border-teal-gray-100 border",
        isHoverUpload && "opacity-[0.34]",
        className,
      )}
      data-testid={isHoverUpload ? "profile-avatar-upload" : undefined}
      style={{ width: size, height: size }}
    >
      {isFilled && src ? (
        <img src={src} alt={alt} className="size-full object-cover" />
      ) : isDefault ? (
        <ProfileIcon className="size-full" aria-hidden="true" />
      ) : null}
    </span>
  )
}
