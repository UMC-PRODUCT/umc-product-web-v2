import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { useState } from "react"

import { Button } from "@/shared/ui/Button"
import { InputBox } from "@/shared/ui/input/InputBox"

export const Route = createFileRoute("/signup/")({
  component: SignUpPage,
})

const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
  e.preventDefault()
}

function SignUpPage() {
  const [email, setEmail] = useState("")
  const isEmailValid = email.includes("@")
  const navigate = useNavigate({ from: Route.fullPath })

  return (
    // __root.tsx의 mb-12를 해제하기 위한 -mb-12
    <section className="-mb-12 flex h-screen min-h-74 w-full min-w-90 items-center justify-center">
      <div className="flex flex-col items-center gap-10">
        <span className="text-heading-3-semibold text-teal-gray-900">
          회원가입
        </span>

        <form
          onSubmit={handleSubmit}
          className="flex w-full flex-col items-center gap-8"
        >
          <div className="flex flex-col gap-1.5">
            <div>
              <span className="text-body-1-medium text-teal-gray-600">
                이메일
              </span>
              <span className="text-body-1-medium text-error-600">*</span>
            </div>

            <div className="flex items-center gap-1.5">
              <InputBox
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="이메일"
              />
              <Button
                size={"m"}
                color={"primary"}
                variant={"weak"}
                disabled={!isEmailValid}
              >
                인증하기
              </Button>
            </div>

            <p className="text-body-2-medium text-error-500 h-5.5">
              {/* TODO: "이미 가입된 이메일입니다." or "인증 메일을 받지 못하셨나요?" 출력 */}
            </p>
          </div>
          <div className="flex w-full flex-col items-center gap-4">
            <Button
              size={"m"}
              color={"primary"}
              variant={"fill"}
              disabled={true}
              className="w-full"
            >
              다음
            </Button>

            <button
              onClick={() => navigate({ to: "/login" })}
              className="px-1 py-0.5"
            >
              <span className="text-body-1-regular text-teal-gray-500">
                이미 계정이 있어요
              </span>
            </button>
          </div>
        </form>
      </div>
    </section>
  )
}
