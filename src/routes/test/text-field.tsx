import { createFileRoute } from "@tanstack/react-router"
import { useState } from "react"

import { CheckboxList } from "@/shared/ui/input/checkbox/CheckboxList"
import { OPTION_LIST_CLASS } from "@/shared/ui/input/optionList"
import { RadioList } from "@/shared/ui/input/radio/RadioList"
import { FileUploadField } from "@/shared/ui/question-field/FileUploadField"
import { TextQuestionField } from "@/shared/ui/question-field/TextQuestionField"

import type { ReactNode } from "react"

export const Route = createFileRoute("/test/text-field")({
  component: TextFieldTestPage,
})

const OPTIONS = ["옵션 1", "옵션 2", "옵션 3"]

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex w-[600px] max-w-full flex-col gap-3">
      <h2 className="border-teal-gray-100 text-label-1-semibold text-teal-gray-500 border-b pb-1">
        {title}
      </h2>
      {children}
    </section>
  )
}

function TextFieldTestPage() {
  const [textLg, setTextLg] = useState("")
  const [textMd, setTextMd] = useState("사용자가 입력한 텍스트입니다.")
  const [checks, setChecks] = useState<string[]>(["옵션 1"])
  const [checksMd, setChecksMd] = useState<string[]>([])
  const [radioLg, setRadioLg] = useState("옵션 1")
  const [radioMd, setRadioMd] = useState("")

  const toggleCheck = (
    list: string[],
    setter: (v: string[]) => void,
    opt: string,
    checked: boolean,
  ) => {
    setter(checked ? [...list, opt] : list.filter((x) => x !== opt))
  }

  return (
    <main className="bg-teal-gray-50 flex min-h-screen w-full flex-col gap-10 p-10">
      <h1 className="text-heading-6-semibold text-teal-gray-900">
        Text Field Box Test Page
      </h1>

      <div className="flex flex-wrap gap-10">
        <Section title="Text — Lg (기본)">
          <TextQuestionField value={textLg} onChange={setTextLg} />
        </Section>
        <Section title="Text — Md">
          <TextQuestionField value={textMd} onChange={setTextMd} size="md" />
        </Section>

        <Section title="Check List — Lg">
          <div className={OPTION_LIST_CLASS}>
            {OPTIONS.map((opt) => (
              <CheckboxList
                key={opt}
                checked={checks.includes(opt)}
                onChange={(c) => toggleCheck(checks, setChecks, opt, c)}
              >
                {opt}
              </CheckboxList>
            ))}
          </div>
        </Section>
        <Section title="Check List — Md">
          <div className={OPTION_LIST_CLASS}>
            {OPTIONS.map((opt) => (
              <CheckboxList
                key={opt}
                size="md"
                checked={checksMd.includes(opt)}
                onChange={(c) => toggleCheck(checksMd, setChecksMd, opt, c)}
              >
                {opt}
              </CheckboxList>
            ))}
          </div>
        </Section>

        <Section title="Radio List — Lg">
          <div className={OPTION_LIST_CLASS}>
            {OPTIONS.map((opt) => (
              <RadioList
                key={opt}
                checked={radioLg === opt}
                onChange={() => setRadioLg(opt)}
              >
                {opt}
              </RadioList>
            ))}
          </div>
        </Section>
        <Section title="Radio List — Md">
          <div className={OPTION_LIST_CLASS}>
            {OPTIONS.map((opt) => (
              <RadioList
                key={opt}
                size="md"
                checked={radioMd === opt}
                onChange={() => setRadioMd(opt)}
              >
                {opt}
              </RadioList>
            ))}
          </div>
        </Section>

        <Section title="Upload — Lg (empty / filled)">
          <FileUploadField
            fileName={null}
            onUpload={() => {}}
            onDelete={() => {}}
          />
          <FileUploadField
            fileName="2026_UXUI 포트폴리오_이방토.pdf"
            onUpload={() => {}}
            onDelete={() => {}}
          />
        </Section>
        <Section title="Upload — Md">
          <FileUploadField
            fileName={null}
            size="md"
            onUpload={() => {}}
            onDelete={() => {}}
          />
          <FileUploadField
            fileName="2026_UXUI 포트폴리오_이방토.pdf"
            size="md"
            onUpload={() => {}}
            onDelete={() => {}}
          />
        </Section>
      </div>
    </main>
  )
}
