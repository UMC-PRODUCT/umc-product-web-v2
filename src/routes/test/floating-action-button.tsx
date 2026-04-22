import { createFileRoute } from "@tanstack/react-router"

import { FloatingActionButton } from "@/shared/ui/button/FloatingActionButton"

export const Route = createFileRoute("/test/floating-action-button")({
  component: FloatingActionButtonTestPage,
})

function FloatingActionButtonTestPage() {
  return (
    <main className="bg-teal-gray-50 min-h-screen w-full p-10">
      <h1 className="text-heading-6-semibold text-teal-gray-900 mb-10">
        FloatingActionButton Test Page
      </h1>

      <section className="flex flex-col gap-4">
        <h2 className="border-teal-gray-100 text-label-1-semibold text-teal-gray-500 border-b pb-1">
          Default / Active (버튼을 누르고 있는 동안 active 상태 적용)
        </h2>
        <div className="flex items-center gap-6">
          <FloatingActionButton aria-label="항목 추가" />
        </div>
      </section>
    </main>
  )
}
