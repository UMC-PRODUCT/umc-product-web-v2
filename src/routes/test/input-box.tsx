import { createFileRoute } from "@tanstack/react-router"
import { useState } from "react"

import {
  InputBox,
  type InputBoxState,
  type InputBoxType,
} from "@/shared/ui/input/InputBox"
import {
  type MemberItem,
  MemberSearchBar,
} from "@/shared/ui/searchbar/MemberSearchBar"

export const Route = createFileRoute("/test/input-box")({
  component: InputBoxTestPage,
})

const STATES = [
  "default",
  "success",
  "error",
  "disabled",
] as const satisfies InputBoxState[]
const TYPES = ["default", "clear", "password"] as const satisfies InputBoxType[]

const MOCK_MEMBERS: MemberItem[] = [
  { nickname: "이삭", name: "강지훈", university: "OO대학교" },
  { nickname: "이방토", name: "이예원", university: "OO대학교" },
  { nickname: "헤일리", name: "한현서", university: "OO대학교" },
  { nickname: "주디", name: "양혜원", university: "OO대학교" },
  { nickname: "준오", name: "오창준", university: "OO대학교" },
  { nickname: "하늘", name: "박경운", university: "OO대학교" },
  { nickname: "벨라", name: "황지원", university: "OO대학교" },
]

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

function StaticInputCell({
  state,
  type,
  placeholder,
  defaultValue,
}: {
  state: InputBoxState
  type: InputBoxType
  placeholder?: string
  defaultValue?: string
}) {
  const [value, setValue] = useState(defaultValue ?? "")
  return (
    <InputBox
      value={value}
      onChange={(e) => setValue(e.target.value)}
      state={state}
      type={type}
      onClear={() => setValue("")}
      placeholder={placeholder ?? "텍스트 입력"}
    />
  )
}

function PasswordDemo({ state }: { state: InputBoxState }) {
  const [value, setValue] = useState("비밀번호1234")
  return (
    <div className="flex flex-col gap-2">
      <span className="text-caption-2-regular text-teal-gray-400">
        state={state}
      </span>
      <InputBox
        value={value}
        onChange={(e) => setValue(e.target.value)}
        type="password"
        state={state}
        placeholder="비밀번호 입력"
      />
    </div>
  )
}

function InteractiveSearchBar() {
  const [value, setValue] = useState("")
  const [isFocused, setIsFocused] = useState(false)
  const [isSelected, setIsSelected] = useState(false)

  const items = isFocused
    ? value.trim()
      ? MOCK_MEMBERS.filter(
          (m) => m.nickname.includes(value) || m.name.includes(value),
        )
      : MOCK_MEMBERS
    : []

  return (
    <MemberSearchBar
      value={value}
      onChange={(e) => {
        setValue(e.target.value)
        setIsSelected(false)
      }}
      onClear={() => {
        setValue("")
        setIsSelected(false)
      }}
      isSelected={isSelected}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      placeholder="멤버를 검색하세요"
      items={items}
      onSelect={(member) => {
        setValue(`${member.nickname}/${member.name}`)
        setIsSelected(true)
      }}
    />
  )
}

function InputBoxTestPage() {
  return (
    <main className="bg-teal-gray-50 min-h-screen w-full p-10">
      <h1 className="text-heading-6-semibold text-teal-gray-900 mb-10">
        InputBox Test Page
      </h1>

      <div className="flex flex-col gap-12">
        <Section title="State × Type Matrix (Empty)">
          <table className="border-collapse">
            <thead>
              <tr>
                <th className="text-caption-2-regular text-teal-gray-400 w-28 pr-8 pb-3 text-left font-normal">
                  state / type
                </th>
                {TYPES.map((t) => (
                  <th
                    key={t}
                    className="text-caption-2-regular text-teal-gray-400 px-4 pb-3 text-center font-normal"
                  >
                    {t}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {STATES.map((state) => (
                <tr key={state}>
                  <td className="text-caption-2-regular text-teal-gray-400 py-3 pr-8 align-middle">
                    {state}
                  </td>
                  {TYPES.map((type) => (
                    <td key={type} className="px-4 py-3 align-middle">
                      <StaticInputCell state={state} type={type} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </Section>

        <Section title="State × Type Matrix (Filled)">
          <table className="border-collapse">
            <thead>
              <tr>
                <th className="text-caption-2-regular text-teal-gray-400 w-28 pr-8 pb-3 text-left font-normal">
                  state / type
                </th>
                {TYPES.map((t) => (
                  <th
                    key={t}
                    className="text-caption-2-regular text-teal-gray-400 px-4 pb-3 text-center font-normal"
                  >
                    {t}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {STATES.map((state) => (
                <tr key={state}>
                  <td className="text-caption-2-regular text-teal-gray-400 py-3 pr-8 align-middle">
                    {state}
                  </td>
                  {TYPES.map((type) => (
                    <td key={type} className="px-4 py-3 align-middle">
                      <StaticInputCell
                        state={state}
                        type={type}
                        defaultValue="입력된 텍스트"
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </Section>

        <Section title="Default — Pseudo State Demo">
          <div className="flex flex-wrap items-end gap-8">
            <div className="flex flex-col gap-2">
              <span className="text-caption-2-regular text-teal-gray-400">
                Default (hover)
              </span>
              <StaticInputCell
                state="default"
                type="default"
                placeholder="hover 해보세요"
              />
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-caption-2-regular text-teal-gray-400">
                Focus (클릭)
              </span>
              <StaticInputCell
                state="default"
                type="default"
                placeholder="클릭하면 Teal border"
              />
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-caption-2-regular text-teal-gray-400">
                Filled (값 있음)
              </span>
              <StaticInputCell
                state="default"
                type="default"
                defaultValue="Filled 상태"
              />
            </div>
          </div>
        </Section>

        <Section title="Password — Visible / Hidden Toggle">
          <div className="flex flex-wrap gap-8">
            <PasswordDemo state="default" />
            <PasswordDemo state="success" />
            <PasswordDemo state="error" />
          </div>
        </Section>

        <Section title="MemberSearchBar (Controlled) — InputBox 합성 검증">
          <InteractiveSearchBar />
        </Section>
      </div>
    </main>
  )
}
