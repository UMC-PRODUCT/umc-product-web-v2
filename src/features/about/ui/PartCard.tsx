import { GlassRim } from "@/shared/ui/GlassRim"

import { glassSurface } from "./glassSurface"

const CARD_SURFACE = glassSurface(123.4432, -64.524)

interface PartCardProps {
  titleLines: readonly string[]
  descriptionLines: readonly string[]
}

export function PartCard({ titleLines, descriptionLines }: PartCardProps) {
  return (
    <div
      className="relative flex h-full flex-col items-start self-stretch rounded-[30px] border-t-4 border-teal-300 px-7 pt-9 pb-10"
      style={CARD_SURFACE}
    >
      <GlassRim radius={30} from={0.101} to={0.174} bottomRight={0.174} />

      {/* 1440 은 네 장이 한 줄이라 제목 줄 수가 섞인다. 한 줄짜리 카드의 간격을
          벌려 설명 시작선을 맞춘다. 2x2 로 접히는 1024 이하는 같은 행끼리 줄 수가
          같아 벌릴 이유가 없다. */}
      <div
        className={`relative flex w-full flex-col items-start ${
          titleLines.length > 1
            ? "gap-8 md:gap-6.5"
            : "gap-8 md:gap-15 lg:gap-6.5 xl:gap-15"
        }`}
      >
        <h3 className="w-full text-2xl leading-[1.33] font-semibold text-white md:text-[26px] md:leading-[1.3]">
          {titleLines.map((line) => (
            <span key={line} className="block">
              {line}
            </span>
          ))}
        </h3>
        {/* 줄바꿈 위치를 카피에서 정한다. 자동 줄바꿈에 맡기면 단어 중간에서
            끊긴다. */}
        <p className="text-teal-gray-300 flex w-full flex-col text-base leading-[1.45] tracking-[-0.16px]">
          {descriptionLines.map((line) => (
            <span key={line}>{line}</span>
          ))}
        </p>
      </div>
    </div>
  )
}
