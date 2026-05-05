import { createFileRoute } from "@tanstack/react-router"
import { useNavigate } from "@tanstack/react-router"

import { Divider, LoginButton } from "@/features/login"
import UmcLogo from "@/shared/assets/icon/logo/UmcLogo"
import { Button } from "@/shared/ui/Button"

export const Route = createFileRoute("/login/")({
  component: SocialLoginPage,
})

function SocialLoginPage() {
  const navigate = useNavigate({ from: Route.fullPath })

  return (
    // __root.tsx의 mb-12를 해제하기 위한 -mb-12
    <section className="-mb-12 flex h-screen min-h-125 w-full min-w-90 items-center justify-center">
      <div className="flex flex-col items-center gap-16 pb-6.5">
        <button
          onClick={() => navigate({ to: "/" })}
          className="flex flex-col items-center gap-4.5"
        >
          <UmcLogo className="h-12.5" />

          <p className="text-label-2-medium text-teal-gray-900 h-5">
            UNIVERSITY MAKEUS CHALLENGE
          </p>
        </button>

        <div className="flex flex-col items-center gap-4">
          <div className="flex flex-col items-center gap-3">
            {/* TODO: 소셜 로그인 API 연동 */}
            <LoginButton social={"apple"} />
            <LoginButton social={"google"} />
            <LoginButton social={"kakao"} />
          </div>

          <Divider />

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
