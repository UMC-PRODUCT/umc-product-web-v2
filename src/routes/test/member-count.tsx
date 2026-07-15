import { createFileRoute } from "@tanstack/react-router"

import MemberCount from "@/shared/ui/MemberCount"

export const Route = createFileRoute("/test/member-count")({
  component: MemberCountTestPage,
})

const SIZES = ["xs", "sm", "md", "lg"] as const

function MemberCountTestPage() {
  return (
    <main className="bg-teal-gray-50 min-h-screen w-full p-10">
      <h1 className="text-heading-6-semibold text-teal-gray-900 mb-10">
        MemberCount Test Page
      </h1>

      <table className="border-collapse">
        <thead>
          <tr>
            <th className="text-caption-2-regular text-teal-gray-400 w-20 pr-8 pb-3 text-left font-normal">
              size
            </th>
            <th className="text-caption-2-regular text-teal-gray-400 px-6 pb-3 text-center font-normal">
              MemberCount
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
                <MemberCount current={3} total={10} size={size} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  )
}
