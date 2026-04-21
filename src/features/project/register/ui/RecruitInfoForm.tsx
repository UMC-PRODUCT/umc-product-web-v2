import { useState } from "react"

import { Button } from "@/shared/ui/Button"
import { OptionButton } from "@/shared/ui/option-button/OptionButton"
import { OptionButtonGroup } from "@/shared/ui/option-button/OptionButtonGroup"

import { SectionHeader } from "./SectionHeader"

const ROLES = [
  { key: "design", label: "Design", stacks: [] },
  { key: "frontend", label: "Frontend", stacks: ["Web", "iOS", "Android"] },
  { key: "backend", label: "Backend", stacks: ["SpringBoot", "Node.js"] },
] as const

type RoleKey = (typeof ROLES)[number]["key"]

interface RoleState {
  count: number
  stack: string | undefined
}

interface RecruitInfoFormProps {
  onPrev: () => void
}

function Stepper({
  value,
  onChange,
}: {
  value: number
  onChange: (v: number) => void
}) {
  return (
    <div className="border-teal-gray-300 flex h-10 items-center rounded-[8px] border">
      <button
        type="button"
        className="text-teal-gray-500 disabled:text-teal-gray-300 flex h-full w-10 items-center justify-center disabled:cursor-not-allowed"
        onClick={() => onChange(Math.max(0, value - 1))}
        disabled={value === 0}
        aria-label="인원 감소"
      >
        −
      </button>
      <span className="text-body-2-medium text-teal-gray-900 w-6 text-center">
        {value}
      </span>
      <button
        type="button"
        className="text-teal-gray-500 flex h-full w-10 items-center justify-center"
        onClick={() => onChange(value + 1)}
        aria-label="인원 증가"
      >
        +
      </button>
    </div>
  )
}

function buildSummaryText(
  roles: typeof ROLES,
  states: Record<RoleKey, RoleState>,
): string {
  return roles
    .filter(({ key }) => states[key].count > 0)
    .map(({ key, label }) => {
      const { count, stack } = states[key]
      const name = stack ?? label
      return `${name} ${count}명`
    })
    .join(", ")
}

export function RecruitInfoForm({ onPrev }: RecruitInfoFormProps) {
  const [roleStates, setRoleStates] = useState<Record<RoleKey, RoleState>>({
    design: { count: 0, stack: undefined },
    frontend: { count: 0, stack: undefined },
    backend: { count: 0, stack: undefined },
  })

  const totalCount = Object.values(roleStates).reduce(
    (sum, { count }) => sum + count,
    0,
  )

  const summaryText = buildSummaryText(ROLES, roleStates)

  const updateCount = (key: RoleKey, count: number) => {
    setRoleStates((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        count,
        stack: count === 0 ? undefined : prev[key].stack,
      },
    }))
  }

  const updateStack = (key: RoleKey, stack: string | undefined) => {
    setRoleStates((prev) => ({
      ...prev,
      [key]: { ...prev[key], stack },
    }))
  }

  return (
    <div className="flex flex-col gap-6 pt-4">
      <div className="px-4 pt-10">
        <SectionHeader index={1} title="모집 인원 및 스택" />
        <div className="border-teal-gray-200 mx-8.5 flex w-full flex-col gap-11.5 border-b pt-6 pb-11">
          {ROLES.map(({ key, label, stacks }) => (
            <div key={key} className="flex items-center gap-6">
              <span className="text-body-1-regular text-teal-gray-700 w-16 shrink-0">
                {label}
              </span>
              <Stepper
                value={roleStates[key].count}
                onChange={(v) => updateCount(key, v)}
              />
              {stacks.length > 0 && roleStates[key].count > 0 && (
                <OptionButtonGroup
                  variant="segmented"
                  allowDeselect
                  value={roleStates[key].stack}
                  onValueChange={(v) => updateStack(key, v)}
                >
                  {stacks.map((stack) => (
                    <OptionButton key={stack} value={stack}>
                      {stack}
                    </OptionButton>
                  ))}
                </OptionButtonGroup>
              )}
            </div>
          ))}
        </div>
        <div className="bg-teal-gray-100 mt-4 mb-21 flex w-full items-center rounded-[8px] px-7 py-2.5">
          <div className="text-subtitle-3-semibold border-teal-gray-200 flex border-r pr-7.5 text-teal-600">
            <span className="mr-17">총 모집 인원</span>
            <span className="mr-1">{totalCount}</span>
            <span>명</span>
          </div>
          <span className="text-teal-gray-700 text-body-1-regular ml-7.5">
            {summaryText || "직군별 인원을 선택해주세요"}
          </span>
        </div>
      </div>
      <div className="flex justify-between">
        <Button type="button" variant="weak" color="primary">
          임시 저장
        </Button>
        <div className="flex items-center gap-4">
          <Button type="button" variant="weak" color="neutral" onClick={onPrev}>
            이전
          </Button>
          <Button type="submit" variant="fill" color="primary">
            다음
          </Button>
        </div>
      </div>
    </div>
  )
}
