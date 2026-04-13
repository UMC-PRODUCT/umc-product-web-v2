import { StepperItem } from "./StepperItem"

const ITEMS = [
  { idx: 1, label: "기본 정보" },
  { idx: 2, label: "모집 정보" },
  { idx: 3, label: "지원 문항" },
]

interface StepperProps {
  step: number
  onStepChange: (idx: number) => void
}

export function Stepper({ step, onStepChange }: StepperProps) {
  return (
    <section className="bg-teal-gray-100 flex h-11.5 min-w-225 items-center gap-2 rounded-[14px] p-1">
      {ITEMS.map((item) => (
        <StepperItem
          key={item.idx}
          isSelected={item.idx === step}
          onClick={() => onStepChange(item.idx)}
          {...item}
        />
      ))}
    </section>
  )
}
