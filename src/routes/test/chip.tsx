import { createFileRoute } from "@tanstack/react-router"

import { ParTagChip } from "@/shared/ui/chip/ParTagChip"

export const Route = createFileRoute("/test/chip")({
  component: ChipTestPage,
})

const ROLES = [
  "plan",
  "design",
  "web",
  "ios",
  "android",
  "springboot",
  "nodejs",
] as const

const TYPES = ["default", "light"] as const

function ChipTestPage() {
  return (
    <main className="bg-teal-gray-50 min-h-screen w-full p-10">
      <h1 className="text-heading-6-semibold text-teal-gray-900 mb-10">
        Role Tag Chip Test Page
      </h1>

      <table className="border-collapse">
        <thead>
          <tr>
            <th className="text-caption-2-regular text-teal-gray-400 w-36 pr-8 pb-3 text-left font-normal">
              role
            </th>
            {TYPES.map((type) => (
              <th
                key={type}
                className="text-caption-2-regular text-teal-gray-400 px-6 pb-3 text-center font-normal"
              >
                {type}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {ROLES.map((role) => (
            <tr key={role}>
              <td className="text-caption-2-regular text-teal-gray-400 py-2 pr-8 align-middle">
                {role}
              </td>
              {TYPES.map((type) => (
                <td key={type} className="px-6 py-2 text-center align-middle">
                  <ParTagChip role={role} type={type} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  )
}
