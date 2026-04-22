import { createFileRoute } from "@tanstack/react-router"
import { useState } from "react"

import { Radio } from "@/shared/ui/input/Radio"
import { RadioList } from "@/shared/ui/input/RadioList"

export const Route = createFileRoute("/test/radio")({
  component: RadioTestPage,
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

function Cell({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col items-start gap-1.5">
      <span className="text-caption-1-medium text-teal-gray-500">{label}</span>
      {children}
    </div>
  )
}

function ControlledRadio({
  variant,
  disabled,
}: {
  variant: "gray" | "primary"
  disabled?: boolean
}) {
  const [checked, setChecked] = useState(false)
  return (
    <div className="flex flex-col items-start gap-1.5">
      <Radio
        variant={variant}
        checked={checked}
        onChange={setChecked}
        disabled={disabled}
        aria-label={`${variant} 라디오`}
      />
      <span className="text-caption-1-medium text-teal-gray-500">
        {checked ? "On" : "Off"}
      </span>
    </div>
  )
}

function RadioTestPage() {
  return (
    <main className="bg-teal-gray-50 min-h-screen w-full p-10">
      <h1 className="text-heading-6-semibold text-teal-gray-900 mb-10">
        Radio Test Page
      </h1>

      <div className="flex flex-col gap-10">
        <Section title="Controlled (클릭 토글)">
          <div className="flex items-start gap-8">
            <Cell label="Gray (enabled)">
              <ControlledRadio variant="gray" />
            </Cell>
            <Cell label="Primary (enabled)">
              <ControlledRadio variant="primary" />
            </Cell>
            <Cell label="Primary (disabled)">
              <ControlledRadio variant="primary" disabled />
            </Cell>
          </div>
        </Section>

        <Section title="Unchecked 상태">
          <div className="flex items-start gap-8">
            <Cell label="Gray / disabled">
              <Radio
                variant="gray"
                checked={false}
                onChange={() => {}}
                aria-label="Gray unchecked disabled"
              />
            </Cell>
            <Cell label="Primary / enabled">
              <Radio
                variant="primary"
                checked={false}
                onChange={() => {}}
                aria-label="Primary unchecked enabled"
              />
            </Cell>
            <Cell label="Primary / disabled">
              <Radio
                variant="primary"
                checked={false}
                onChange={() => {}}
                disabled
                aria-label="Primary unchecked disabled"
              />
            </Cell>
          </div>
        </Section>

        <Section title="Checked 상태">
          <div className="flex items-start gap-8">
            <Cell label="Primary / enabled">
              <Radio
                variant="primary"
                checked={true}
                onChange={() => {}}
                aria-label="Primary checked enabled"
              />
            </Cell>
            <Cell label="Primary / disabled">
              <Radio
                variant="primary"
                checked={true}
                onChange={() => {}}
                disabled
                aria-label="Primary checked disabled"
              />
            </Cell>
          </div>
        </Section>

        <Section title="RadioList">
          <div className="bg-teal-gray-100 flex flex-col gap-2 rounded-[8px] p-4">
            <RadioListRow />
            <RadioListRow />
            <RadioListRow defaultChecked />
          </div>
        </Section>
      </div>
    </main>
  )
}

function RadioListRow({
  defaultChecked = false,
}: {
  defaultChecked?: boolean
}) {
  const [checked, setChecked] = useState(defaultChecked)
  return (
    <RadioList checked={checked} onChange={setChecked}>
      Radio button
    </RadioList>
  )
}
