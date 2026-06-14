import { StepperTab } from "./StepperTab"

const ITEMS = [
  { idx: 1, label: "기본 정보" },
  { idx: 2, label: "모집 정보" },
  { idx: 3, label: "지원 문항" },
]

interface StepperProps {
  step: number
  onStepChange: (idx: number) => void
  disabledSteps?: number[]
  disabledTooltips?: Partial<Record<number, string>>
  openTooltipStep?: number | null
}

export function Stepper({
  step,
  onStepChange,
  disabledSteps = [],
  disabledTooltips = {},
  openTooltipStep = null,
}: StepperProps) {
  return (
    <section
      role="tablist"
      aria-label="등록 단계"
      className="bg-teal-gray-100 bp1:gap-2 flex h-11.5 w-full min-w-0 items-center gap-1 rounded-[14px] p-1"
    >
      {ITEMS.map((item) => (
        <StepperTab
          key={item.idx}
          isSelected={item.idx === step}
          disabled={disabledSteps.includes(item.idx)}
          disabledTooltip={disabledTooltips[item.idx]}
          tooltipOpen={openTooltipStep === item.idx}
          onClick={() => onStepChange(item.idx)}
          {...item}
        />
      ))}
    </section>
  )
}
