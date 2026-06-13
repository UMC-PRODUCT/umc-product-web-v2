import { createFileRoute } from "@tanstack/react-router"

import { useToastStore } from "@/components/toast/useToastStore"

export const Route = createFileRoute("/test/toast")({
  component: ToastTestPage,
})

const CASES = [
  { color: "primary", variant: "deep", type: "default" },
  { color: "primary", variant: "weak", type: "default" },
  { color: "primary", variant: "weak", type: "time" },
  { color: "red", variant: "deep", type: "default" },
  { color: "red", variant: "weak", type: "default" },
] as const

function ToastTestPage() {
  const addToast = useToastStore((s) => s.addToast)

  return (
    <main className="flex min-h-screen flex-col gap-4 p-10">
      <h1 className="text-heading-6-semibold text-teal-gray-900 mb-6">
        Toast Test Page
      </h1>
      <div className="flex flex-col gap-3">
        {CASES.map(({ color, variant, type }) => (
          <button
            key={`${color}-${variant}-${type}`}
            type="button"
            onClick={() =>
              addToast({
                message: "토스트바 알림 내용",
                color,
                variant,
                type,
                duration: 3000,
              })
            }
            className="bg-teal-gray-100 text-teal-gray-700 text-label-1-medium w-fit rounded-[8px] px-4 py-2"
          >
            color:{color} / variant:{variant} / type:{type}
          </button>
        ))}
        <button
          type="button"
          onClick={() =>
            addToast({
              message:
                "매우 긴 에러 메시지입니다. 너비가 400px를 넘으면 콘텐츠에 맞춰 늘어나고, 90vw 상한에 도달하면 줄바꿈되며 토스트 높이가 늘어나는지 확인합니다.",
              color: "red",
              variant: "deep",
              type: "default",
              duration: 5000,
            })
          }
          className="bg-error-100 text-error-700 text-label-1-medium w-fit rounded-[8px] px-4 py-2"
        >
          긴 메시지 테스트 (red/deep)
        </button>
        <button
          type="button"
          onClick={() =>
            addToast({
              message:
                "리크루팅 서비스는 준비 중입니다. 더 나은 UMC 웹사이트로 찾아뵙겠습니다!",
              color: "primary",
              variant: "deep",
              type: "notice",
              duration: 3000,
            })
          }
          className="text-label-1-medium w-fit rounded-[8px] bg-teal-100 px-4 py-2 text-teal-700"
        >
          notice (서비스 공지)
        </button>
      </div>
    </main>
  )
}
