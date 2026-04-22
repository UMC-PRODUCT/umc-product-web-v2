import { createFileRoute } from "@tanstack/react-router"
import { useState } from "react"

import { Toggle } from "@/shared/ui/Toggle"

export const Route = createFileRoute("/test/toggle")({
  component: ToggleTestPage,
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

function ControlledToggle({ size }: { size?: "sm" | "md" }) {
  const [checked, setChecked] = useState(false)
  return (
    <div className="flex flex-col gap-2">
      <Toggle
        checked={checked}
        onChange={setChecked}
        size={size}
        aria-label={`토글 ${size ?? "md"}`}
      />
      <p className="text-caption-1-medium text-teal-gray-500">
        상태: <strong>{checked ? "On" : "Off"}</strong>
      </p>
    </div>
  )
}

function ToggleTestPage() {
  return (
    <main className="bg-teal-gray-50 min-h-screen w-full p-10">
      <h1 className="text-heading-6-semibold text-teal-gray-900 mb-10">
        Toggle Test Page
      </h1>

      <div className="flex flex-col gap-10">
        <Section title="Md — Off/On 전환">
          <ControlledToggle size="md" />
        </Section>

        <Section title="Sm — Off/On 전환">
          <ControlledToggle size="sm" />
        </Section>

        <Section title="고정 상태 비교">
          <div className="flex items-center gap-6">
            <div className="flex flex-col items-start gap-1.5">
              <span className="text-caption-1-medium text-teal-gray-500">
                Md Off
              </span>
              <Toggle
                checked={false}
                onChange={() => {}}
                size="md"
                aria-label="Md Off 고정"
              />
            </div>
            <div className="flex flex-col items-start gap-1.5">
              <span className="text-caption-1-medium text-teal-gray-500">
                Md On
              </span>
              <Toggle
                checked={true}
                onChange={() => {}}
                size="md"
                aria-label="Md On 고정"
              />
            </div>
            <div className="flex flex-col items-start gap-1.5">
              <span className="text-caption-1-medium text-teal-gray-500">
                Sm Off
              </span>
              <Toggle
                checked={false}
                onChange={() => {}}
                size="sm"
                aria-label="Sm Off 고정"
              />
            </div>
            <div className="flex flex-col items-start gap-1.5">
              <span className="text-caption-1-medium text-teal-gray-500">
                Sm On
              </span>
              <Toggle
                checked={true}
                onChange={() => {}}
                size="sm"
                aria-label="Sm On 고정"
              />
            </div>
          </div>
        </Section>
      </div>
    </main>
  )
}
