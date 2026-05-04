import ProfileIcon from "@/shared/assets/icon/people/ProfileIcon"
import { cn } from "@/shared/lib/utils"

interface ProfileProps {
  size?: number
  src?: string | null
  className?: string
}

export default function Profile({ size = 40, src, className }: ProfileProps) {
  return (
    <div
      className={cn("shrink-0 overflow-hidden rounded-full", className)}
      style={{ width: size, height: size }}
    >
      {src ? (
        <img src={src} alt="profile" className="size-full object-cover" />
      ) : (
        <ProfileIcon className="size-full" />
      )}
    </div>
  )
}
