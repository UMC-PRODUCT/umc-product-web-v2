import { createFileRoute } from "@tanstack/react-router"
import { useEffect, useRef, useState } from "react"

import {
  InputBox,
  type InputBoxSize,
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
const SIZES = ["sm", "md"] as const satisfies InputBoxSize[]

const VERIFICATION_CASES: { seconds: number; label: string }[] = [
  { seconds: 180, label: "03:00" },
  { seconds: 65, label: "01:05" },
  { seconds: 5, label: "00:05" },
  { seconds: 0, label: "00:00" },
]

const MOCK_MEMBERS: MemberItem[] = [
  { id: "mock-1", nickname: "이삭", name: "강지훈", university: "OO대학교" },
  { id: "mock-2", nickname: "이방토", name: "이예원", university: "OO대학교" },
  { id: "mock-3", nickname: "헤일리", name: "한현서", university: "OO대학교" },
  { id: "mock-4", nickname: "주디", name: "양혜원", university: "OO대학교" },
  { id: "mock-5", nickname: "준오", name: "오창준", university: "OO대학교" },
  { id: "mock-6", nickname: "하늘", name: "박경운", university: "OO대학교" },
  { id: "mock-7", nickname: "벨라", name: "황지원", university: "OO대학교" },
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

function VerificationCountdownDemo() {
  const [value, setValue] = useState("")
  const [remaining, setRemaining] = useState(180)
  const [running, setRunning] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (!running) return
    intervalRef.current = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          setRunning(false)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [running])

  function handleReset() {
    if (intervalRef.current) clearInterval(intervalRef.current)
    setRemaining(180)
    setRunning(false)
  }

  return (
    <div className="flex flex-col gap-3">
      <InputBox
        type="verification"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        remainingSeconds={remaining}
        inputMode="numeric"
        maxLength={6}
        placeholder="인증번호 6자리"
      />
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setRunning((r) => !r)}
          className="text-caption-2-regular rounded bg-teal-500 px-3 py-1 text-white"
        >
          {running ? "일시정지" : "시작"}
        </button>
        <button
          type="button"
          onClick={handleReset}
          className="text-caption-2-regular border-teal-gray-300 rounded border px-3 py-1"
        >
          리셋 (03:00)
        </button>
      </div>
    </div>
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

        <Section title="Verification (MM:SS Timer) — State × Size Matrix">
          <table className="border-collapse">
            <thead>
              <tr>
                <th className="text-caption-2-regular text-teal-gray-400 w-28 pr-8 pb-3 text-left font-normal">
                  state / size
                </th>
                {SIZES.map((size) => (
                  <th
                    key={size}
                    className="text-caption-2-regular text-teal-gray-400 px-4 pb-3 text-center font-normal"
                  >
                    {size}
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
                  {SIZES.map((size) => (
                    <td key={size} className="px-4 py-3 align-middle">
                      <InputBox
                        type="verification"
                        state={state}
                        size={size}
                        value=""
                        onChange={() => {}}
                        remainingSeconds={179}
                        placeholder="인증번호"
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </Section>

        <Section title="Verification — 타이머 값 케이스">
          <div className="flex flex-wrap items-end gap-8">
            {VERIFICATION_CASES.map(({ seconds, label }) => (
              <div key={seconds} className="flex flex-col gap-2">
                <span className="text-caption-2-regular text-teal-gray-400">
                  {label}
                </span>
                <InputBox
                  type="verification"
                  value=""
                  onChange={() => {}}
                  remainingSeconds={seconds}
                  placeholder="인증번호"
                />
              </div>
            ))}
          </div>
        </Section>

        <Section title="Verification — 인터랙티브 카운트다운">
          <VerificationCountdownDemo />
        </Section>
      </div>
    </main>
  )
}
