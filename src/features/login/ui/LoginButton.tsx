import { cva, type VariantProps } from "class-variance-authority"

import AppleLogo from "@/shared/assets/icon/logo/AppleLogo"
import GoogleLogo from "@/shared/assets/icon/logo/GoogleLogo"
import KakaoLogo from "@/shared/assets/icon/logo/KakaoLogo"
import { cn } from "@/shared/lib/utils"

const loginButtonVariants = cva(
  "min-w-[360px] min-h-[50px] w-[360px] h-[50px] rounded-[10px] px-7 flex items-center justify-center",
  {
    variants: {
      social: {
        apple: "bg-white border-teal-gray-300 border hover:bg-teal-gray-50",
        google: "bg-white border-teal-gray-300 border hover:bg-teal-gray-50",
        kakao: "bg-[#FEE500] hover:bg-[#F9E108]",
      },
    },
    defaultVariants: {
      social: "apple",
    },
  },
)

interface LoginButtonProps
  extends
    React.ComponentProps<"button">,
    VariantProps<typeof loginButtonVariants> {}

export function LoginButton({ className, social, ...props }: LoginButtonProps) {
  const currentSocial = social || "apple"
  const socialConfig = {
    apple: {
      Icon: AppleLogo,
      label: "Apple 로그인",
      iconClass: "h-6 w-6 text-black",
    },
    google: { Icon: GoogleLogo, label: "Google 로그인", iconClass: "h-5 w-5" },
    kakao: {
      Icon: KakaoLogo,
      label: "카카오 로그인",
      iconClass: "h-5 w-5 text-black",
    },
  } as const
  const { Icon, label, iconClass } = socialConfig[currentSocial]

  return (
    <button
      className={cn(loginButtonVariants({ social }), className)}
      {...props}
    >
      <div className="flex items-center justify-center gap-3">
        <Icon className={iconClass} />
        <span className="text-label-1-medium text-teal-gray-900">{label}</span>
      </div>
    </button>
  )
}
