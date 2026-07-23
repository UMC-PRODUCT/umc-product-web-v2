import { createFileRoute } from "@tanstack/react-router"

import { RecruitmentSectionHeader } from "@/features/recruiting"

import type { ReactNode } from "react"

export const Route = createFileRoute("/test/recruitment-section-header")({
  component: RecruitmentSectionHeaderTestPage,
})

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="border-teal-gray-100 text-label-1-semibold text-teal-gray-500 border-b pb-1">
        {title}
      </h2>
      {children}
    </section>
  )
}

function RecruitmentSectionHeaderTestPage() {
  return (
    <main className="bg-teal-gray-50 min-h-screen w-full p-10">
      <h1 className="text-heading-6-semibold text-teal-gray-900 mb-10">
        RecruitmentSectionHeader Test Page
      </h1>

      <div className="flex flex-col gap-10">
        <Section title="Default">
          <RecruitmentSectionHeader index={1} title="모집 정보" />
        </Section>

        <Section title="Required(* 표시)">
          <RecruitmentSectionHeader index={1} title="모집 정보" required />
        </Section>
      </div>
    </main>
  )
}
