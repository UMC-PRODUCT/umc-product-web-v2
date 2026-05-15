import { createFileRoute, redirect } from "@tanstack/react-router"

import { OAUTH_VERIFICATION_TOKEN_KEY } from "@/features/auth/lib/handleLoginResponse"
import { useSignupStore } from "@/features/auth/store/signupStore"
import { SignupStepBasicInfo } from "@/features/auth/ui/SignupStepBasicInfo"
import { SignupStepEmail } from "@/features/auth/ui/SignupStepEmail"
import { SignupStepTerms } from "@/features/auth/ui/SignupStepTerms"

export const Route = createFileRoute("/signup/oauth")({
  beforeLoad: () => {
    const token = sessionStorage.getItem(OAUTH_VERIFICATION_TOKEN_KEY)
    if (!token) {
      throw redirect({ to: "/login" })
    }
    useSignupStore.getState().init(token)
  },
  component: OAuthSignupPage,
})

function OAuthSignupPage() {
  const step = useSignupStore((s) => s.step)

  return (
    <section className="-mb-12 flex h-screen min-h-125 w-full min-w-90 items-center justify-center">
      {step === "email" && <SignupStepEmail />}
      {step === "basic-info" && <SignupStepBasicInfo />}
      {step === "terms" && <SignupStepTerms />}
    </section>
  )
}
