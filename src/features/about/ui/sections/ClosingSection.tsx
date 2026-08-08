import { ABOUT_CLOSING } from "../../constants"
import { GlassCtaButton } from "../GlassCtaButton"

export function ClosingSection() {
  return (
    <section className="flex flex-col items-center gap-6.5 pt-49 pb-72">
      <div className="flex w-full flex-col items-center gap-6.5">
        <div className="flex flex-col items-start gap-6.25 text-center">
          <p className="w-full text-[22px] leading-[20.8px] font-medium tracking-[2px] text-teal-400 uppercase">
            {ABOUT_CLOSING.eyebrow}
          </p>
          {/* TODO: 시안은 KIMM Bold 100px(노드 12836:123273)이다. 프로젝트에 해당
              웹폰트가 없어 벡터가 필요하다. 에셋이 들어오면 히어로처럼 컴포넌트로
              교체한다. 지금은 Pretendard 로 폴백돼 자간·인상이 시안과 다르다. */}
          <p className="text-[100px] leading-[101.2px] font-bold tracking-[-8px] whitespace-nowrap text-white">
            {ABOUT_CLOSING.headline}
          </p>
        </div>
        <p className="text-teal-gray-400 w-full pt-0.5 pb-4.5 text-center text-2xl leading-7 font-light tracking-[-0.72px]">
          {ABOUT_CLOSING.description}
        </p>
      </div>
      <GlassCtaButton tone="primary">{ABOUT_CLOSING.ctaLabel}</GlassCtaButton>
    </section>
  )
}
