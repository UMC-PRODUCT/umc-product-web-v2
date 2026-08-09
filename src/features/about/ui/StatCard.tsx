import { GlassRim } from "./GlassRim"
import { glassSurface } from "./glassSurface"

const CARD_SURFACE = glassSurface(135.5724, -53.6481, 0.048)

interface StatCardProps {
  label: string
  value: string
  unit: string
}

export function StatCard({ label, value, unit }: StatCardProps) {
  return (
    <div
      className="relative flex h-full min-w-px flex-1 flex-col items-end justify-between rounded-[30px] px-8 pt-8 pb-9"
      style={CARD_SURFACE}
    >
      <GlassRim
        radius={30}
        from={0.069}
        to={0.181}
        topLeft={0.069}
        bottomRight={0.199}
      />

      <p className="relative w-full text-2xl leading-[1.3] tracking-[-0.96px] text-white">
        {label}
      </p>

      <p className="relative flex w-full items-end justify-end gap-1 tracking-[-3px] text-shadow-[0_0_20px_rgba(255,255,255,0.5)]">
        <span className="text-[72px] leading-18 font-bold text-teal-50">
          {value}
        </span>
        {/* + 는 숫자 줄 위쪽에, 단위는 아래쪽에 붙는다. 둘은 4px 겹친다. */}
        <span className="text-teal-gray-200 flex self-stretch font-medium">
          <span className="-mr-1 text-[38px] leading-none">+</span>
          <span className="flex h-11 items-center self-end text-[34px] leading-none">
            {unit}
          </span>
        </span>
      </p>
    </div>
  )
}
