import { createFileRoute } from "@tanstack/react-router"
import { useState } from "react"

import { Checkbox } from "@/shared/ui/input/checkbox/Checkbox"
import { CheckboxList } from "@/shared/ui/input/checkbox/CheckboxList"
import { CheckboxFieldList } from "@/shared/ui/question-field/CheckboxFieldList"

export const Route = createFileRoute("/test/checkbox")({
  component: CheckboxTestPage,
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

function ControlledCheckbox({
  variant,
  size,
  disabled,
}: {
  variant: "gray" | "primary" | "issue"
  size?: "default" | "lg"
  disabled?: boolean
}) {
  const [checked, setChecked] = useState(false)
  return (
    <div className="flex flex-col items-start gap-1.5">
      <Checkbox
        variant={variant}
        size={size}
        checked={checked}
        onChange={setChecked}
        disabled={disabled}
        aria-label={`${variant}${size === "lg" ? " lg" : ""}${disabled ? " disabled" : ""} 체크박스`}
      />
      <span className="text-caption-1-medium text-teal-gray-400">
        {checked ? "On" : "Off"}
      </span>
    </div>
  )
}

function CheckboxListRow({
  defaultChecked = false,
}: {
  defaultChecked?: boolean
}) {
  const [checked, setChecked] = useState(defaultChecked)
  return (
    <CheckboxList checked={checked} onChange={setChecked}>
      체크리스트 항목
    </CheckboxList>
  )
}

function CheckboxFieldListSection() {
  const [options, setOptions] = useState([
    { content: "옵션 1" },
    { content: "옵션 2" },
  ])
  return <CheckboxFieldList options={options} onOptionsChange={setOptions} />
}

function CheckboxTestPage() {
  return (
    <main className="bg-teal-gray-50 min-h-screen w-full p-10">
      <h1 className="text-heading-6-semibold text-teal-gray-900 mb-10">
        Checkbox Test Page
      </h1>

      <div className="flex flex-col gap-10">
        <Section title="Checkbox — Controlled (클릭 토글) / default (20px)">
          <div className="flex items-start gap-8">
            <Cell label="Gray (enabled)">
              <ControlledCheckbox variant="gray" />
            </Cell>
            <Cell label="Primary (enabled)">
              <ControlledCheckbox variant="primary" />
            </Cell>
            <Cell label="Primary (disabled)">
              <ControlledCheckbox variant="primary" disabled />
            </Cell>
            <Cell label="Issue (enabled)">
              <ControlledCheckbox variant="issue" />
            </Cell>
            <Cell label="Issue (disabled)">
              <ControlledCheckbox variant="issue" disabled />
            </Cell>
          </div>
        </Section>

        <Section title="Checkbox — Controlled (클릭 토글) / lg (24px)">
          <div className="flex items-start gap-8">
            <Cell label="Gray (enabled)">
              <ControlledCheckbox variant="gray" size="lg" />
            </Cell>
            <Cell label="Primary (enabled)">
              <ControlledCheckbox variant="primary" size="lg" />
            </Cell>
            <Cell label="Primary (disabled)">
              <ControlledCheckbox variant="primary" size="lg" disabled />
            </Cell>
            <Cell label="Issue (enabled)">
              <ControlledCheckbox variant="issue" size="lg" />
            </Cell>
            <Cell label="Issue (disabled)">
              <ControlledCheckbox variant="issue" size="lg" disabled />
            </Cell>
          </div>
        </Section>

        <Section title="Checkbox — Unchecked 상태 / default">
          <div className="flex items-start gap-8">
            <Cell label="Gray / enabled">
              <Checkbox
                variant="gray"
                checked={false}
                onChange={() => {}}
                aria-label="Gray unchecked enabled"
              />
            </Cell>
            <Cell label="Gray / disabled">
              <Checkbox
                variant="gray"
                checked={false}
                onChange={() => {}}
                disabled
                aria-label="Gray unchecked disabled"
              />
            </Cell>
            <Cell label="Primary / enabled">
              <Checkbox
                variant="primary"
                checked={false}
                onChange={() => {}}
                aria-label="Primary unchecked enabled"
              />
            </Cell>
            <Cell label="Primary / disabled">
              <Checkbox
                variant="primary"
                checked={false}
                onChange={() => {}}
                disabled
                aria-label="Primary unchecked disabled"
              />
            </Cell>
            <Cell label="Issue / enabled">
              <Checkbox
                variant="issue"
                checked={false}
                onChange={() => {}}
                aria-label="Issue unchecked enabled"
              />
            </Cell>
            <Cell label="Issue / disabled">
              <Checkbox
                variant="issue"
                checked={false}
                onChange={() => {}}
                disabled
                aria-label="Issue unchecked disabled"
              />
            </Cell>
          </div>
        </Section>

        <Section title="Checkbox — Unchecked 상태 / lg">
          <div className="flex items-start gap-8">
            <Cell label="Gray / enabled">
              <Checkbox
                variant="gray"
                size="lg"
                checked={false}
                onChange={() => {}}
                aria-label="Gray lg unchecked enabled"
              />
            </Cell>
            <Cell label="Gray / disabled">
              <Checkbox
                variant="gray"
                size="lg"
                checked={false}
                onChange={() => {}}
                disabled
                aria-label="Gray lg unchecked disabled"
              />
            </Cell>
            <Cell label="Primary / enabled">
              <Checkbox
                variant="primary"
                size="lg"
                checked={false}
                onChange={() => {}}
                aria-label="Primary lg unchecked enabled"
              />
            </Cell>
            <Cell label="Primary / disabled">
              <Checkbox
                variant="primary"
                size="lg"
                checked={false}
                onChange={() => {}}
                disabled
                aria-label="Primary lg unchecked disabled"
              />
            </Cell>
            <Cell label="Issue / enabled">
              <Checkbox
                variant="issue"
                size="lg"
                checked={false}
                onChange={() => {}}
                aria-label="Issue lg unchecked enabled"
              />
            </Cell>
            <Cell label="Issue / disabled">
              <Checkbox
                variant="issue"
                size="lg"
                checked={false}
                onChange={() => {}}
                disabled
                aria-label="Issue lg unchecked disabled"
              />
            </Cell>
          </div>
        </Section>

        <Section title="Checkbox — Checked 상태 / default">
          <div className="flex items-start gap-8">
            <Cell label="Primary / enabled">
              <Checkbox
                variant="primary"
                checked={true}
                onChange={() => {}}
                aria-label="Primary checked enabled"
              />
            </Cell>
            <Cell label="Primary / disabled">
              <Checkbox
                variant="primary"
                checked={true}
                onChange={() => {}}
                disabled
                aria-label="Primary checked disabled"
              />
            </Cell>
            <Cell label="Issue / enabled">
              <Checkbox
                variant="issue"
                checked={true}
                onChange={() => {}}
                aria-label="Issue checked enabled"
              />
            </Cell>
            <Cell label="Issue / disabled">
              <Checkbox
                variant="issue"
                checked={true}
                onChange={() => {}}
                disabled
                aria-label="Issue checked disabled"
              />
            </Cell>
          </div>
        </Section>

        <Section title="Checkbox — Checked 상태 / lg">
          <div className="flex items-start gap-8">
            <Cell label="Primary / enabled">
              <Checkbox
                variant="primary"
                size="lg"
                checked={true}
                onChange={() => {}}
                aria-label="Primary lg checked enabled"
              />
            </Cell>
            <Cell label="Primary / disabled">
              <Checkbox
                variant="primary"
                size="lg"
                checked={true}
                onChange={() => {}}
                disabled
                aria-label="Primary lg checked disabled"
              />
            </Cell>
            <Cell label="Issue / enabled">
              <Checkbox
                variant="issue"
                size="lg"
                checked={true}
                onChange={() => {}}
                aria-label="Issue lg checked enabled"
              />
            </Cell>
            <Cell label="Issue / disabled">
              <Checkbox
                variant="issue"
                size="lg"
                checked={true}
                onChange={() => {}}
                disabled
                aria-label="Issue lg checked disabled"
              />
            </Cell>
          </div>
        </Section>

        <Section title="CheckboxList">
          <div className="bg-teal-gray-100 flex flex-col gap-2 rounded-[8px] p-4">
            <CheckboxListRow />
            <CheckboxListRow />
            <CheckboxListRow defaultChecked />
          </div>
        </Section>

        <Section title="CheckboxFieldList (옵션 편집)">
          <div className="w-full max-w-sm">
            <CheckboxFieldListSection />
          </div>
        </Section>
      </div>
    </main>
  )
}
