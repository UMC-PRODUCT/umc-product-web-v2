import { createFileRoute } from "@tanstack/react-router"
import { useState } from "react"

import { FormHeader } from "@/shared/ui/FormHeader"

export const Route = createFileRoute("/test/form-header")({
  component: FormHeaderTestPage,
})

function Section({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="border-teal-gray-100 text-label-1-semibold text-teal-gray-500 border-b pb-1">
        {title}
      </h2>
      {children}
    </section>
  )
}

function FormHeaderTestPage() {
  return (
    <main className="bg-teal-gray-50 min-h-screen w-full p-10">
      <h1 className="text-heading-6-semibold text-teal-gray-900 mb-10">
        FormHeader Test Page
      </h1>

      <div className="flex flex-col gap-10">
        <Section title="Common — 공통 문항 섹션 헤더">
          <FormHeader variant="common" />
        </Section>

        <Section title="Part — 기본 (Part 1)">
          <InteractivePartHeader partName="Part 1" />
        </Section>

        <Section title="Part — 다양한 partName">
          <div className="flex flex-col gap-3">
            <InteractivePartHeader partName="Part 1" />
            <InteractivePartHeader partName="Part 2" />
            <InteractivePartHeader
              partName="Section A"
              defaultChecked={false}
            />
            <InteractivePartHeader partName="지원자 정보" />
          </div>
        </Section>

        <Section title="조합 — Common + Part 수직 배치">
          <div className="flex flex-col gap-3">
            <FormHeader variant="common" />
            <InteractivePartHeader partName="Part 1" />
          </div>
        </Section>
      </div>
    </main>
  )
}

function InteractivePartHeader({
  partName,
  defaultChecked = true,
}: {
  partName: string
  defaultChecked?: boolean
}) {
  const [checked, setChecked] = useState(defaultChecked)
  return (
    <FormHeader
      variant="part"
      partName={partName}
      toggleChecked={checked}
      onToggleChange={setChecked}
    />
  )
}
