import { cva, type VariantProps } from "class-variance-authority"

import AppleLogo from "@/shared/assets/icon/logo/AppleLogo"
import GoogleLogo from "@/shared/assets/icon/logo/GoogleLogo"
import KakaoLogo from "@/shared/assets/icon/logo/KakaoLogo"
import { cn } from "@/shared/lib/utils"

const loginButtonVariants = cva(
  "w-[54px] h-[54px] rounded-full flex items-center justify-center",
  {
    variants: {
      social: {
        apple: "bg-black",
        google: "bg-white border border-teal-gray-150",
        kakao: "bg-[#FEE500]",
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

export function LoginCircleButton({
  className,
  social,
  ...props
}: LoginButtonProps) {
  const currentSocial = social || "apple"
  const socialConfig = {
    apple: { Icon: AppleLogo, iconClass: "h-6 w-6 text-white" },
    google: { Icon: GoogleLogo, iconClass: "h-6 w-6" },
    kakao: { Icon: KakaoLogo, iconClass: "h-6 w-6 text-black" },
  } as const
  const { Icon, iconClass } = socialConfig[currentSocial]
  return (
    <button
      className={cn(loginButtonVariants({ social }), className)}
      {...props}
    >
      <Icon className={iconClass} />
    </button>
  )
}
