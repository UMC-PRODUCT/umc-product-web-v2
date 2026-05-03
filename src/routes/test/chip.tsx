import { createFileRoute } from "@tanstack/react-router"

import { ParTagChip } from "@/shared/ui/chip/ParTagChip"
import { RecruitStatusChip } from "@/shared/ui/chip/RecruitStatusChip"
import { RoleTagChip } from "@/shared/ui/chip/RoleTagChip"

export const Route = createFileRoute("/test/chip")({
  component: ChipTestPage,
})

const PARS = [
  "plan",
  "design",
  "web",
  "ios",
  "android",
  "springboot",
  "nodejs",
] as const

const PAR_TYPES = ["default", "light"] as const

const ROLES = ["central", "campus", "challenger"] as const

function ChipTestPage() {
  return (
    <main className="bg-teal-gray-50 flex min-h-screen w-full flex-col gap-12 p-10">
      <section className="flex flex-col gap-4">
        <h1 className="text-heading-6-semibold text-teal-gray-900">
          Par Tag Chip
        </h1>

        <table className="border-collapse">
          <thead>
            <tr>
              <th className="text-caption-2-regular text-teal-gray-400 w-36 pr-8 pb-3 text-left font-normal">
                role
              </th>
              {PAR_TYPES.map((type) => (
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
            {PARS.map((par) => (
              <tr key={par}>
                <td className="text-caption-2-regular text-teal-gray-400 py-2 pr-8 align-middle">
                  {par}
                </td>
                {PAR_TYPES.map((type) => (
                  <td key={type} className="px-6 py-2 text-center align-middle">
                    <ParTagChip role={par} type={type} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="flex flex-col gap-4">
        <h1 className="text-heading-6-semibold text-teal-gray-900">
          Role Tag Chip
        </h1>

        <table className="border-collapse">
          <thead>
            <tr>
              <th className="text-caption-2-regular text-teal-gray-400 w-36 pr-8 pb-3 text-left font-normal">
                role
              </th>
              <th className="text-caption-2-regular text-teal-gray-400 px-6 pb-3 text-center font-normal">
                default
              </th>
            </tr>
          </thead>
          <tbody>
            {ROLES.map((role) => (
              <tr key={role}>
                <td className="text-caption-2-regular text-teal-gray-400 py-2 pr-8 align-middle">
                  {role}
                </td>
                <td className="px-6 py-2 text-center align-middle">
                  <RoleTagChip role={role} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="flex flex-col gap-4">
        <h1 className="text-heading-6-semibold text-teal-gray-900">
          Recruit Status Chip
        </h1>

        <table className="border-collapse">
          <thead>
            <tr>
              <th className="text-caption-2-regular text-teal-gray-400 w-36 pr-8 pb-3 text-left font-normal">
                done
              </th>
              <th className="text-caption-2-regular text-teal-gray-400 px-6 pb-3 text-center font-normal">
                chip
              </th>
            </tr>
          </thead>
          <tbody>
            {[false, true].map((done) => (
              <tr key={String(done)}>
                <td className="text-caption-2-regular text-teal-gray-400 py-2 pr-8 align-middle">
                  {String(done)}
                </td>
                <td className="px-6 py-2 text-center align-middle">
                  <RecruitStatusChip done={done} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </main>
  )
}
