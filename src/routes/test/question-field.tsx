import { createFileRoute } from "@tanstack/react-router"
import { useState } from "react"

import { TextQuestionField } from "@/shared/ui/question-field/TextQuestionField"

export const Route = createFileRoute("/test/question-field")({
  component: QuestionFieldTestPage,
})

function QuestionFieldTestPage() {
  const [value, setValue] = useState("")

  return (
    <main className="bg-teal-gray-50 min-h-screen w-full p-10">
      <h1 className="text-heading-6-semibold text-teal-gray-900 mb-10">
        QuestionField Test Page
      </h1>

      <section className="flex flex-col gap-4">
        <h2 className="border-teal-gray-100 text-label-1-semibold text-teal-gray-500 border-b pb-1">
          Text Type
        </h2>
        <TextQuestionField value={value} onChange={setValue} />
        <p className="text-caption-1-medium text-teal-gray-500">
          state: {value.length === 0 ? "default" : "filled"} (focus 시 카운터
          표시)
        </p>
      </section>
    </main>
  )
}
