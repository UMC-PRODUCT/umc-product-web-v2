import { createFileRoute } from "@tanstack/react-router"

import { RoleTagChip } from "@/shared/ui/chip/RoleTagChip"

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

function ChipTestPage() {
  return (
    <main className="flex min-h-screen flex-col gap-4 p-10">
      <h1 className="text-heading-6-semibold text-teal-gray-900 mb-6">
        Role Tag Chip Test Page
      </h1>
      <div className="flex flex-col gap-3">
        {ROLES.map((role) => (
          <RoleTagChip key={role} role={role} />
        ))}
      </div>
    </main>
  )
}
