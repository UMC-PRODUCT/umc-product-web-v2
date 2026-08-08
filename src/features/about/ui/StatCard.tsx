import { glassBackground } from "./glassBackground"

const CARD_BACKGROUND = glassBackground(135.57, -53.65)

interface StatCardProps {
  label: string
  value: string
  unit: string
}

export function StatCard({ label, value, unit }: StatCardProps) {
  return (
    <div className="relative flex h-full min-w-px flex-1 flex-col items-end justify-between rounded-[30px] px-8 pt-8 pb-9">
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[30px]"
      >
        <span className="absolute inset-0 rounded-[30px] bg-[rgba(38,38,38,0.2)] mix-blend-color-dodge" />
        <span
          className="absolute inset-0 rounded-[30px]"
          style={{ backgroundImage: CARD_BACKGROUND }}
        />
      </span>

      <p className="relative w-full text-2xl leading-[1.3] tracking-[-0.96px] text-white">
        {label}
      </p>

      <p className="relative flex w-full items-end justify-end gap-1 tracking-[-3px] text-shadow-[0_0_20px_rgba(255,255,255,0.5)]">
        <span className="text-[72px] leading-[72px] font-bold text-teal-50">
          {value}
        </span>
        {/* 시안에서 + 와 단위는 숫자보다 작고 아래쪽에 정렬된다. */}
        <span className="text-teal-gray-200 text-[38px] leading-none font-medium">
          +
        </span>
        <span className="text-teal-gray-200 -ml-1 flex h-11 items-center text-[34px] leading-none font-medium">
          {unit}
        </span>
      </p>
    </div>
  )
}
