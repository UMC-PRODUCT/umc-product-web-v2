import { useToastStore } from "@/components/toast/useToastStore"
import { Button } from "@/shared/ui/Button"
import { Counter } from "@/shared/ui/Counter"
import { OptionButton } from "@/shared/ui/option-button/OptionButton"
import { OptionButtonGroup } from "@/shared/ui/option-button/OptionButtonGroup"

import {
  type RoleKey,
  type RoleStack,
  type RoleState,
  useProjectRegisterStore,
} from "../../model/useProjectRegisterStore"
import { SectionHeader } from "../shared/SectionHeader"

const ROLES: {
  key: RoleKey
  label: string
  stacks: RoleStack[]
}[] = [
  { key: "design", label: "Design", stacks: [] },
  { key: "frontend", label: "Frontend", stacks: ["Web", "iOS", "Android"] },
  { key: "backend", label: "Backend", stacks: ["SpringBoot", "Node.js"] },
]

interface RecruitInfoFormProps {
  onPrev: () => void
  onNext: () => void
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

export function RecruitInfoForm({ onPrev, onNext }: RecruitInfoFormProps) {
  const addToast = useToastStore((s) => s.addToast)
  const storeRecruitInfo = useProjectRegisterStore((s) => s.recruitInfo)
  const setRecruitInfo = useProjectRegisterStore((s) => s.setRecruitInfo)

  const roleStates = storeRecruitInfo
  const hasSavedOnce = false

  const totalCount = Object.values(roleStates).reduce(
    (sum, { count }) => sum + count,
    0,
  )

  const summaryText = buildSummaryText(ROLES, roleStates)

  const hasUnsavedChanges = totalCount > 0
  const canTempSave = hasUnsavedChanges
  const tempSaveLabel =
    hasSavedOnce && !hasUnsavedChanges ? "저장 완료" : "임시 저장"

  const handleNext = () => {
    if (totalCount === 0) {
      addToast({
        message: "모집 인원을 1명 이상 입력해주세요.",
        color: "red",
        variant: "deep",
        type: "default",
        duration: 3,
      })
      return
    }
    addToast({
      message: "작성한 내용이 저장되었습니다.",
      color: "primary",
      variant: "deep",
      type: "default",
      duration: 3,
    })
    onNext()
  }

  const handleTempSave = () => {
    setRecruitInfo(roleStates)
    addToast({
      message: "작성한 내용이 임시 저장되었습니다.",
      color: "primary",
      variant: "deep",
      type: "default",
      duration: 3,
    })
  }

  const updateCount = (key: RoleKey, count: number) => {
    setRecruitInfo({
      ...roleStates,
      [key]: {
        ...roleStates[key],
        count,
        stack: count === 0 ? undefined : roleStates[key].stack,
      },
    })
  }

  const updateStack = (key: RoleKey, stack: RoleStack | undefined) => {
    setRecruitInfo({
      ...roleStates,
      [key]: { ...roleStates[key], stack },
    })
  }

  return (
    <div className="flex flex-col gap-6 pt-4">
      <div className="px-4">
        <SectionHeader index={2} title="모집 인원 및 스택" />
        <div className="border-teal-gray-200 mx-8.5 flex w-full flex-col gap-11.5 border-b pt-6 pb-11">
          {ROLES.map(({ key, label, stacks }) => (
            <div key={key} className="flex items-center gap-6">
              <span className="text-body-1-regular text-teal-gray-700 w-16 shrink-0">
                {label}
              </span>
              <Counter
                value={roleStates[key].count}
                onChange={(v) => updateCount(key, v)}
                aria-label={`${label} 인원`}
              />
              {stacks.length > 0 && (
                <OptionButtonGroup
                  variant="segmented"
                  allowDeselect
                  value={roleStates[key].stack}
                  onValueChange={(v) =>
                    updateStack(key, v as RoleStack | undefined)
                  }
                >
                  {stacks.map((stack) => (
                    <OptionButton
                      key={stack}
                      value={stack}
                      disabled={roleStates[key].count === 0}
                    >
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
        <Button
          type="button"
          variant="weak"
          color="primary"
          disabled={!canTempSave}
          onClick={handleTempSave}
        >
          {tempSaveLabel}
        </Button>
        <div className="flex items-center gap-4">
          <Button type="button" variant="weak" color="neutral" onClick={onPrev}>
            이전
          </Button>
          <Button
            type="button"
            variant="fill"
            color="primary"
            onClick={handleNext}
          >
            다음
          </Button>
        </div>
      </div>
    </div>
  )
}
