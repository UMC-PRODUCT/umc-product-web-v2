import { LoginCircleButton } from "@/features/login/ui/LoginCircleButton"
import LinkIcon from "@/shared/assets/icon/link/LinkIcon"
import AppleLogo from "@/shared/assets/icon/logo/AppleLogo"
import GoogleLogoWhite from "@/shared/assets/icon/logo/GoogleLogoWhite"
import KakaoLogo from "@/shared/assets/icon/logo/KakaoLogo"
import { cn } from "@/shared/lib/utils"

export type Social = "apple" | "google" | "kakao"

interface SocialButtonProps {
  social: Social
  linked?: boolean
  onClick?: () => void
}

const unlinkedConfig: Record<
  Social,
  { icon: React.ReactNode; containerClass: string }
> = {
  kakao: {
    icon: <KakaoLogo className="h-6 w-6 text-white" />,
    containerClass: "bg-teal-gray-200",
  },
  apple: {
    icon: <AppleLogo className="h-6 w-6 text-white" />,
    containerClass: "bg-teal-gray-200",
  },
  google: {
    icon: <GoogleLogoWhite />,
    containerClass: "border border-teal-gray-100 bg-teal-gray-200",
  },
}

export function SocialButton({ social, linked, onClick }: SocialButtonProps) {
  if (linked === false) {
    const { icon, containerClass } = unlinkedConfig[social]
    return (
      <button
        type="button"
        onClick={onClick}
        className={cn(
          "flex h-13.5 w-13.5 items-center justify-center rounded-full",
          containerClass,
        )}
      >
        {icon}
      </button>
    )
  }

  return (
    <div className="relative inline-flex">
      <LoginCircleButton social={social} onClick={onClick} />
      {linked === true && (
        <span className="border-teal-gray-100 absolute right-0 bottom-0 flex h-5 w-5 items-center justify-center rounded-full border bg-white">
          <LinkIcon className="text-teal-500" />
        </span>
      )}
    </div>
  )
}
