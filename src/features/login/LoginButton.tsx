import { cva, type VariantProps } from "class-variance-authority"

import AppleLogo from "@/shared/assets/icon/logo/AppleLogo"
import GoogleLogo from "@/shared/assets/icon/logo/GoogleLogo"
import KakaoLogo from "@/shared/assets/icon/logo/KakaoLogo"
import { cn } from "@/shared/lib/utils"

const loginButtonVariants = cva(
  "min-w-[360px] min-h-[50px] w-[360px] h-[50px] rounded-[10px] px-7 flex items-center justify-center text-teal-gray-900",
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

  return (
    <button
      className={cn(loginButtonVariants({ social }), className)}
      {...props}
    >
      <div className="flex items-center justify-center gap-3">
        {currentSocial === "apple" && <AppleLogo className="h-6 w-[20.4px]" />}
        {currentSocial === "apple" && "Apple 로그인"}

        {currentSocial === "google" && <GoogleLogo className="h-5 w-5" />}
        {currentSocial === "google" && "Google 로그인"}

        {currentSocial === "kakao" && <KakaoLogo className="h-5 w-5" />}
        {currentSocial === "kakao" && "카카오 로그인"}
      </div>
    </button>
  )
}
