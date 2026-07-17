import { createFileRoute } from "@tanstack/react-router"

import { RoundNumberTag } from "@/features/matching/ui/RoundNumberTag"
import { PartTagChip } from "@/shared/ui/chip/PartTagChip"
import { RecruitStatusChip } from "@/shared/ui/chip/RecruitStatusChip"
import { RoleTagChip } from "@/shared/ui/chip/RoleTagChip"
import { LabelTag } from "@/shared/ui/tag/LabelTag"
import { NumberTag } from "@/shared/ui/tag/NumberTag"
import { Tag } from "@/shared/ui/tag/Tag"

export const Route = createFileRoute("/test/chip")({
  component: ChipTestPage,
})

const PARTS = [
  "plan",
  "design",
  "web",
  "ios",
  "android",
  "springboot",
  "nodejs",
] as const

const NEW_PARTS = ["pm", "design", "web-pe", "mobile-pe"] as const

const PART_TYPES = ["default", "light"] as const

const ROLES = [
  "superadmin",
  "product",
  "central-president",
  "central-vice-president",
  "hq",
  "chapter",
  "school-president",
  "school-vice-president",
  "school",
  "challenger",
] as const

const TAGS = [
  { tone: "teal", label: "Tag" },
  { tone: "gray", label: "Tag" },
  { tone: "orange", label: "Tag" },
  { tone: "red", label: "Tag" },
] as const

const LABEL_TAG_TONES = [
  "teal",
  "gray",
  "purple",
  "brown",
  "blue",
  "pink",
  "yellow",
] as const

const ROUND_NUMBER_TAG_VARIANTS = [
  "default",
  "round1",
  "round2",
  "round3",
  "random",
] as const

function ChipTestPage() {
  return (
    <main className="bg-teal-gray-50 flex min-h-screen w-full flex-col gap-12 p-10">
      <section className="flex flex-col gap-4">
        <h1 className="text-heading-6-semibold text-teal-gray-900">Tag</h1>
        <div className="flex flex-wrap gap-x-8 gap-y-4">
          {TAGS.map(({ tone, label }) => (
            <Tag key={tone} tone={tone}>
              {label}
            </Tag>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h1 className="text-heading-6-semibold text-teal-gray-900">
          Label Tag
        </h1>
        <div className="flex flex-wrap gap-4">
          {LABEL_TAG_TONES.map((tone) => (
            <div key={tone} className="flex items-center gap-3">
              <LabelTag tone={tone}>칩</LabelTag>
              <LabelTag disabled tone={tone}>
                칩
              </LabelTag>
              <LabelTag tone={tone}>닉네임/이름</LabelTag>
              <LabelTag disabled tone={tone}>
                닉네임/이름
              </LabelTag>
            </div>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h1 className="text-heading-6-semibold text-teal-gray-900">
          Part Tag Chip
        </h1>

        <table className="border-collapse">
          <thead>
            <tr>
              <th className="text-caption-2-regular text-teal-gray-400 w-36 pr-8 pb-3 text-left font-normal">
                role
              </th>
              {PART_TYPES.map((type) => (
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
            {PARTS.map((part) => (
              <tr key={part}>
                <td className="text-caption-2-regular text-teal-gray-400 py-2 pr-8 align-middle">
                  {part}
                </td>
                {PART_TYPES.map((type) => (
                  <td key={type} className="px-6 py-2 text-center align-middle">
                    <PartTagChip role={part} type={type} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="flex flex-col gap-4">
        <h1 className="text-heading-6-semibold text-teal-gray-900">
          Part Tag Chip (통합 체계)
        </h1>

        <table className="border-collapse">
          <thead>
            <tr>
              <th className="text-caption-2-regular text-teal-gray-400 w-36 pr-8 pb-3 text-left font-normal">
                role
              </th>
              {PART_TYPES.map((type) => (
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
            {NEW_PARTS.map((part) => (
              <tr key={part}>
                <td className="text-caption-2-regular text-teal-gray-400 py-2 pr-8 align-middle">
                  {part}
                </td>
                {PART_TYPES.map((type) => (
                  <td key={type} className="px-6 py-2 text-center align-middle">
                    <PartTagChip role={part} type={type} />
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
              <th className="text-caption-2-regular text-teal-gray-400 px-6 pb-3 text-center font-normal">
                lg
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
                <td className="px-6 py-2 text-center align-middle">
                  <RoleTagChip role={role} size="lg" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="flex flex-col gap-4">
        <h1 className="text-heading-6-semibold text-teal-gray-900">
          Number Tag
        </h1>
        <div className="flex flex-wrap items-center gap-4">
          {[1, 2, 12].map((value) => (
            <div key={value} className="flex items-center gap-2">
              <NumberTag value={value} />
              <NumberTag value={value} variant="dimmed" />
            </div>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h1 className="text-heading-6-semibold text-teal-gray-900">
          Matching Round Number Tag
        </h1>
        <div className="flex flex-wrap items-center gap-4">
          {ROUND_NUMBER_TAG_VARIANTS.map((variant) => (
            <RoundNumberTag key={variant} variant={variant} />
          ))}
        </div>
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
