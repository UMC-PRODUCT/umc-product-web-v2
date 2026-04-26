import { createFileRoute } from "@tanstack/react-router"
import { useState } from "react"

import { CounterLabel } from "@/shared/ui/CounterLabel"

export const Route = createFileRoute("/test/counter-label")({
  component: CounterLabelTestPage,
})

const SIZES = ["xs", "sm", "md"] as const
const MAX = 100

function CounterLabelTestPage() {
  const [value, setValue] = useState("")

  return (
    <main className="bg-teal-gray-50 min-h-screen w-full p-10">
      <h1 className="text-heading-6-semibold text-teal-gray-900 mb-10">
        CounterLabel Test Page
      </h1>

      <div className="flex flex-col gap-10">
        <textarea
          className="border-teal-gray-200 text-body-2-regular text-teal-gray-900 w-full max-w-md resize-none rounded-[8px] border bg-white p-3 outline-none"
          rows={4}
          maxLength={MAX}
          placeholder="텍스트를 입력하세요"
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />

        <table className="border-collapse">
          <thead>
            <tr>
              <th className="text-caption-2-regular text-teal-gray-400 w-20 pr-8 pb-3 text-left font-normal">
                size
              </th>
              <th className="text-caption-2-regular text-teal-gray-400 px-6 pb-3 text-center font-normal">
                CounterLabel
              </th>
            </tr>
          </thead>
          <tbody>
            {SIZES.map((size) => (
              <tr key={size}>
                <td className="text-caption-2-regular text-teal-gray-400 py-3 pr-8 align-middle">
                  {size}
                </td>
                <td className="px-6 py-3 align-middle">
                  <CounterLabel
                    current={value.length}
                    total={MAX}
                    size={size}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  )
}
