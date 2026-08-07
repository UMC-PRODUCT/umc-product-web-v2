import ProfileIcon from "@/shared/assets/icon/people/ProfileIcon"
import CloudUploadIcon from "@/shared/assets/icon/upload/CloudUploadIcon"
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
  return (
    <span
      className={cn(
        "relative inline-flex shrink-0 overflow-hidden rounded-full",
        className,
      )}
      style={{ width: size, height: size }}
    >
      {src ? (
        <img src={src} alt={alt} className="size-full object-cover" />
      ) : (
        <ProfileIcon className="size-full" aria-hidden="true" />
      )}
      {state === "hover-upload" && (
        <span
          data-testid="profile-avatar-upload"
          className="absolute inset-0 flex items-center justify-center bg-black/40 text-white"
        >
          <CloudUploadIcon className="size-5" aria-hidden="true" />
        </span>
      )}
    </span>
  )
}
