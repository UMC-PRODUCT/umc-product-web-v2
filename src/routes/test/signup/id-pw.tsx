import { createFileRoute } from "@tanstack/react-router"
import { useEffect } from "react"

import { useSignupStore } from "@/features/auth/store/signupStore"
import { SignupStepBasicInfo } from "@/features/auth/ui/SignupStepBasicInfo"
import { SignupStepEmail } from "@/features/auth/ui/SignupStepEmail"
import { SignupStepIdPwCredentials } from "@/features/auth/ui/SignupStepIdPwCredentials"
import { SignupStepTerms } from "@/features/auth/ui/SignupStepTerms"
import UmcLogo from "@/shared/assets/icon/logo/UmcLogo"

export const Route = createFileRoute("/test/signup/id-pw")({
  component: IdPwSignupPage,
})

const STEP_LABELS = {
  credentials: "1 / 4",
  email: "2 / 4",
  "basic-info": "3 / 4",
  terms: "4 / 4",
}

function IdPwSignupPage() {
  const { step, initIdPw } = useSignupStore()

  useEffect(() => {
    initIdPw()
  }, [initIdPw])

  return (
    <main className="flex min-h-[80vh] flex-col items-center justify-center gap-8 px-4">
      <div className="flex flex-col items-center gap-3">
        <UmcLogo className="h-8 w-auto text-teal-600" />
        <p className="text-heading-2-bold text-teal-gray-900">회원가입</p>
        <p className="text-label-2-medium text-teal-gray-400">
          임시 페이지 — 디자인 확정 후 교체 예정 ({STEP_LABELS[step]})
        </p>
      </div>
      {step === "credentials" && <SignupStepIdPwCredentials />}
      {step === "email" && <SignupStepEmail />}
      {step === "basic-info" && <SignupStepBasicInfo />}
      {step === "terms" && <SignupStepTerms />}
    </main>
  )
}
