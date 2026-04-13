import { createFileRoute } from "@tanstack/react-router"

import { useToastStore } from "@/stores/useToastStore"

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
                duration: 3,
              })
            }
            className="bg-teal-gray-100 text-teal-gray-700 text-label-1-medium w-fit rounded-[8px] px-4 py-2"
          >
            color:{color} / variant:{variant} / type:{type}
          </button>
        ))}
      </div>
    </main>
  )
}
