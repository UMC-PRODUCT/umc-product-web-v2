import { createFileRoute } from "@tanstack/react-router"
import { useState } from "react"

import { CodeInput } from "@/shared/ui/input/CodeInput"

export const Route = createFileRoute("/test/code-input")({
  component: CodeInputTestPage,
})

function CodeInputTestPage() {
  const [basic, setBasic] = useState("")
  const [completed, setCompleted] = useState<string | null>(null)
  const [errorCode, setErrorCode] = useState("02EEY0")

  return (
    <div className="flex flex-col gap-10 p-10">
      <h1 className="text-teal-gray-700 text-[26px] font-semibold">
        CodeInput
      </h1>

      <section className="flex flex-col gap-3">
        <p className="text-teal-gray-700 font-medium">
          기본 (자동 포커스 / 붙여넣기 / onComplete)
        </p>
        <CodeInput
          value={basic}
          onChange={(v) => {
            setBasic(v)
            setCompleted(null)
          }}
          onComplete={setCompleted}
          autoFocus
        />
        <p className="text-teal-gray-500">현재 값: {basic || "(없음)"}</p>
        {completed && <p className="text-teal-600">onComplete: {completed}</p>}
      </section>

      <section className="flex flex-col gap-3">
        <p className="text-teal-gray-700 font-medium">에러 상태</p>
        <CodeInput value={errorCode} onChange={setErrorCode} state="error" />
        <p className="text-error-500">올바르지 않은 인증코드입니다</p>
      </section>

      <section className="flex flex-col gap-3">
        <p className="text-teal-gray-700 font-medium">비활성</p>
        <CodeInput value="02EE" onChange={() => {}} state="disabled" />
      </section>
    </div>
  )
}
