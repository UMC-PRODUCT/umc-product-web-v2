import { createFileRoute } from "@tanstack/react-router"
import { type ReactNode } from "react"

import { OptionButton } from "@/shared/ui/option-button/OptionButton"
import { OptionButtonGroup } from "@/shared/ui/option-button/OptionButtonGroup"

export const Route = createFileRoute("/test/option-button")({
  component: OptionButtonTestPage,
})

type Size = "xl" | "sm" | "xs"

const PARTS = [
  { value: "design", label: "Design" },
  { value: "frontend", label: "Frontend" },
  { value: "backend", label: "Backend" },
  { value: "pm", label: "PM" },
]

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

function SelectRow({
  size,
  defaultValue,
}: {
  size?: Size
  defaultValue?: string
}) {
  return (
    <OptionButtonGroup variant="segmented" defaultValue={defaultValue}>
      {PARTS.map((p) => (
        <OptionButton key={p.value} size={size} value={p.value}>
          {p.label}
        </OptionButton>
      ))}
    </OptionButtonGroup>
  )
}

function SizeBlock({ size, label }: { size?: Size; label: string }) {
  return (
    <Section title={label}>
      <div className="flex flex-col items-start gap-3">
        <SelectRow size={size} defaultValue="design" />
        <SelectRow size={size} defaultValue="backend" />
        <SelectRow size={size} />
      </div>
    </Section>
  )
}

function OptionButtonTestPage() {
  return (
    <main className="bg-teal-gray-50 min-h-screen w-full p-10">
      <h1 className="text-heading-6-semibold text-teal-gray-900 mb-10">
        OptionButton Test Page (V2.0)
      </h1>

      <div className="flex flex-col gap-10">
        <SizeBlock
          size="xl"
          label="XL — 48px (선택 Left / 선택 Middle / 선택 없음)"
        />
        <SizeBlock size="sm" label="Sm (기본) — 38px" />
        <SizeBlock size="xs" label="Xs — 28px" />

        <Section title="Disabled">
          <div className="flex flex-col items-start gap-3">
            <OptionButtonGroup variant="segmented" defaultValue="frontend">
              <OptionButton value="design" disabled>
                Design
              </OptionButton>
              <OptionButton value="frontend">Frontend</OptionButton>
              <OptionButton value="backend" disabled>
                Backend
              </OptionButton>
            </OptionButtonGroup>
            <OptionButtonGroup variant="segmented" defaultValue="frontend">
              <OptionButton size="xs" value="design">
                Design
              </OptionButton>
              <OptionButton size="xs" value="frontend" disabled>
                Frontend
              </OptionButton>
              <OptionButton size="xs" value="backend">
                Backend
              </OptionButton>
            </OptionButtonGroup>
          </div>
        </Section>

        <Section title="Multiple (다중 선택)">
          <OptionButtonGroup
            type="multiple"
            variant="segmented"
            defaultValue={["all"]}
          >
            <OptionButton size="xs" value="all">
              전체
            </OptionButton>
            <OptionButton size="xs" value="1">
              1차
            </OptionButton>
            <OptionButton size="xs" value="2">
              2차
            </OptionButton>
            <OptionButton size="xs" value="3">
              3차
            </OptionButton>
          </OptionButtonGroup>
        </Section>
      </div>
    </main>
  )
}
