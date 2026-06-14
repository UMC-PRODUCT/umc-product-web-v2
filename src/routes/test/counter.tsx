import { createFileRoute } from "@tanstack/react-router"
import { useState } from "react"

import { Counter } from "@/shared/ui/Counter"

export const Route = createFileRoute("/test/counter")({
  component: CounterTestPage,
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

function ControlledCounter() {
  const [value, setValue] = useState(0)
  return (
    <div className="flex flex-col gap-2">
      <Counter value={value} onChange={setValue} aria-label="수량" />
      <p className="text-caption-1-regular text-teal-gray-500">
        현재 값: <strong>{value}</strong>
      </p>
    </div>
  )
}

function CounterTestPage() {
  return (
    <main className="bg-teal-gray-50 min-h-screen w-full p-10">
      <h1 className="text-heading-6-semibold text-teal-gray-900 mb-10">
        Counter Test Page
      </h1>

      <div className="flex flex-col gap-10">
        <Section title="기본 (min=0, 초기값=0)">
          <ControlledCounter />
        </Section>

        <Section title="min=1, max=5 (범위 제한)">
          <div className="flex flex-col gap-2">
            <Counter
              value={3}
              onChange={() => {}}
              min={1}
              max={5}
              aria-label="제한된 수량"
            />
            <p className="text-caption-1-regular text-teal-gray-500">
              value=3, min=1, max=5 (고정값 표시용)
            </p>
          </div>
        </Section>

        <Section title="min=0, value=0 (감소 비활성)">
          <Counter value={0} onChange={() => {}} aria-label="최솟값 상태" />
        </Section>

        <Section title="max=3, value=3 (증가 비활성)">
          <Counter
            value={3}
            onChange={() => {}}
            max={3}
            aria-label="최댓값 상태"
          />
        </Section>

        <Section title="step=2">
          <div className="flex flex-col gap-2">
            <Counter
              value={0}
              onChange={() => {}}
              step={2}
              aria-label="2씩 증감"
            />
            <p className="text-caption-1-regular text-teal-gray-500">
              2씩 증감 (고정값 표시용)
            </p>
          </div>
        </Section>

        <Section title="disabled">
          <div className="flex gap-4">
            <Counter
              value={0}
              onChange={() => {}}
              disabled
              aria-label="전체 비활성"
            />
            <Counter
              value={3}
              onChange={() => {}}
              disabled
              aria-label="전체 비활성 (값 있음)"
            />
          </div>
        </Section>
      </div>
    </main>
  )
}
