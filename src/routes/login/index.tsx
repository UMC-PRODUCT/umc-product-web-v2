import { createFileRoute } from "@tanstack/react-router"

import { LoginButton } from "@/features/login"
import UmcLogo from "@/shared/assets/icon/logo/UmcLogo"
import { Button } from "@/shared/ui/Button"

export const Route = createFileRoute("/login/")({
  component: SocialLoginPage,
})

function SocialLoginPage() {
  return (
    // __root.tsx의 mb-12를 해제하기 위한 -mb-12
    <section className="-mb-12 flex h-screen min-h-125 w-full min-w-90 items-center justify-center">
      <div className="flex flex-col items-center gap-16 pb-6.5">
        <div className="flex flex-col items-center gap-4.5">
          <UmcLogo className="h-12.5" />

          <p className="text-label-2-medium text-teal-gray-900 h-5">
            UNIVERSITY MAKEUS CHALLENGE
          </p>
        </div>

        <div className="flex flex-col items-center gap-4">
          <div className="flex flex-col items-center gap-3">
            {/* TODO: 소셜 로그인 API 연동 */}
            <LoginButton social={"apple"} />
            <LoginButton social={"google"} />
            <LoginButton social={"kakao"} />
          </div>

          <div className="flex h-6 items-center gap-3">
            <div className="bg-teal-gray-200 h-[1.5px] w-[80.5px] rounded-[0.75px]"></div>
            <span className="text-teal-gray-400 text-body-1-regular">or</span>
            <div className="bg-teal-gray-200 h-[1.5px] w-[80.5px] rounded-[0.75px]"></div>
          </div>

          <div className="flex flex-col items-center gap-3.5">
            {/* TODO: 로그인 API 연동 */}
            <Button
              variant={"weak"}
              color={"primary"}
              className="h-12.5 w-90 rounded-[10px] px-4 py-1 text-[16px]"
            >
              UMC 계정 로그인
            </Button>
            {/* TODO: 아이디/비밀번호 찾기 연동 */}
            <button className="text-body-1-regular text-teal-gray-500 flex h-7 items-center justify-center px-1 py-0.5">
              아이디/비밀번호 찾기
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
