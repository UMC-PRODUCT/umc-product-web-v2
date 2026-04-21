import { createFileRoute } from "@tanstack/react-router"
import { useState } from "react"

import { MemberSearchBar } from "@/shared/ui/searchbar/MemberSearchBar"

export const Route = createFileRoute("/test/member-search-bar")({
  component: SearchBarTestPage,
})

const MOCK_MEMBERS = [
  { nickname: "이삭", name: "강지훈" },
  { nickname: "이방토", name: "이예원" },
  { nickname: "헤일리", name: "한현서" },
  { nickname: "주디", name: "양혜원" },
  { nickname: "준오", name: "오창준" },
  { nickname: "하늘", name: "박경운" },
  { nickname: "벨라", name: "황지원" },
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

function InteractiveSearchBar() {
  const [value, setValue] = useState("")
  const [isFocused, setIsFocused] = useState(false)
  const [isSelected, setIsSelected] = useState(false)

  const filtered = isFocused
    ? value.trim()
      ? MOCK_MEMBERS.filter(
          (m) => m.nickname.includes(value) || m.name.includes(value),
        )
      : MOCK_MEMBERS
    : []

  return (
    <div className="relative w-[312px]">
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
      />
      {filtered.length > 0 && (
        <ul className="shadow-drop-neutral-3 absolute top-full left-0 z-10 mt-1 w-full overflow-hidden rounded-[12px] bg-white">
          {filtered.map((member) => (
            <li key={member.name}>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  setValue(`${member.nickname}/${member.name}`)
                  setIsSelected(true)
                }}
                className="text-body-2-medium text-teal-gray-900 hover:bg-teal-gray-200 w-full px-4 py-3 text-left leading-none"
              >
                {member.nickname}/{member.name}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function SearchBarTestPage() {
  return (
    <main className="bg-teal-gray-50 min-h-screen w-full p-10">
      <h1 className="text-heading-6-semibold text-teal-gray-900 mb-10">
        SearchBar Test Page
      </h1>

      <div className="flex flex-col gap-10">
        <Section title="Default">
          <MemberSearchBar
            value=""
            onChange={() => {}}
            onClear={() => {}}
            placeholder="멤버를 검색하세요"
          />
        </Section>

        <Section title="Focus">
          <MemberSearchBar
            autoFocus
            value=""
            onChange={() => {}}
            onClear={() => {}}
            placeholder="멤버를 검색하세요"
          />
        </Section>

        <Section title="Selected">
          <MemberSearchBar
            value="홍길동"
            onChange={() => {}}
            onClear={() => {}}
            placeholder="멤버를 검색하세요"
          />
        </Section>

        <Section title="Interactive (Controlled)">
          <InteractiveSearchBar />
        </Section>
      </div>
    </main>
  )
}
