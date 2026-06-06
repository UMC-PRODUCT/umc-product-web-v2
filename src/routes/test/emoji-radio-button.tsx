import { createFileRoute } from "@tanstack/react-router"
import { useState } from "react"

import { EmojiRadioButton } from "@/features/usability-survey/ui/EmojiRadioButton"

export const Route = createFileRoute("/test/emoji-radio-button")({
  component: EmojiRadioButtonTestPage,
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
      <h2 className="text-label-1-semibold text-teal-gray-500 border-teal-gray-100 border-b pb-1">
        {title}
      </h2>
      {children}
    </section>
  )
}

function EmojiRadioButtonTestPage() {
  const [toggled, setToggled] = useState(false)

  return (
    <main className="bg-teal-gray-50 min-h-screen w-full p-10">
      <h1 className="text-heading-6-semibold text-teal-gray-900 mb-10">
        EmojiRadioButton Test Page
      </h1>

      <div className="flex flex-col gap-10">
        <Section title="States (hover는 마우스 오버로 확인)">
          <div className="flex items-center gap-4">
            <EmojiRadioButton selected label="감정 텍스트" />
            <EmojiRadioButton selected={false} label="감정 텍스트" />
          </div>
        </Section>

        <Section title="Interactive (클릭 시 selected 토글)">
          <EmojiRadioButton
            selected={toggled}
            label="감정 텍스트"
            onClick={() => setToggled((prev) => !prev)}
          />
          <p className="text-body-2-medium text-teal-gray-600">
            selected: {String(toggled)}
          </p>
        </Section>

        <Section title="긴 텍스트 (너비 확장)">
          <div className="flex flex-col items-start gap-4">
            <EmojiRadioButton
              selected
              label="아주 긴 감정 텍스트가 들어가도 확장됩니다"
            />
            <EmojiRadioButton selected={false} label="짧음" />
          </div>
        </Section>
      </div>
    </main>
  )
}
