import { GlassRim } from "@/shared/ui/GlassRim"

import { glassSurface } from "./glassSurface"

const CARD_SURFACE = glassSurface(123.4432, -64.524)

interface PartCardProps {
  titleLines: readonly string[]
  description: string
}

export function PartCard({ titleLines, description }: PartCardProps) {
  return (
    <div
      className="relative flex h-full flex-col items-start self-stretch rounded-[30px] border-t-4 border-teal-300 px-7 pt-9 pb-10"
      style={CARD_SURFACE}
    >
      <GlassRim radius={30} from={0.101} to={0.174} bottomRight={0.174} />

      {/* 제목이 한 줄인 카드와 두 줄인 카드가 섞여 있다. 시안은 두 경우의 제목과
          설명 사이 간격을 다르게 잡아 설명 시작선을 맞춘다. */}
      <div
        className={`relative flex w-55.75 flex-col items-start ${
          titleLines.length > 1 ? "gap-6.5" : "gap-15"
        }`}
      >
        <h3 className="w-full text-[26px] leading-[1.3] font-semibold text-white">
          {titleLines.map((line) => (
            <span key={line} className="block">
              {line}
            </span>
          ))}
        </h3>
        <p className="text-teal-gray-300 w-full text-base leading-[1.45] tracking-[-0.16px]">
          {description}
        </p>
      </div>
    </div>
  )
}
