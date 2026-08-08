import BreakTheRules from "@/shared/assets/image/about/BreakTheRules"

import { ABOUT_HERO } from "../../constants"
import { GlassCtaButton } from "../GlassCtaButton"

export function HeroSection() {
  return (
    <section className="flex items-center justify-center px-15 pt-85 pb-69.5">
      <div className="flex flex-col items-center gap-6.5">
        <div className="flex w-full flex-col items-start gap-6.5">
          <div className="flex flex-col items-start gap-6.25 text-center">
            <p className="w-full text-[22px] leading-[20.8px] font-medium tracking-[2px] text-teal-400 uppercase">
              {ABOUT_HERO.eyebrow}
            </p>
            {/* 시안의 텍스트 박스는 102px 인데 글자 잉크는 76px 이다. 위아래 여백을
                맞춰야 아래 설명과의 간격이 시안과 같아진다. */}
            <div className="flex h-25.5 items-center">
              <BreakTheRules
                className="h-19 w-243.75 text-white"
                role="img"
                aria-label={ABOUT_HERO.headlineAlt}
              />
            </div>
          </div>
          <p className="text-teal-gray-400 w-full pt-0.5 pb-4.5 text-center text-2xl leading-7 font-light tracking-[-0.72px]">
            {ABOUT_HERO.description}
          </p>
        </div>
        <GlassCtaButton>{ABOUT_HERO.ctaLabel}</GlassCtaButton>
      </div>
    </section>
  )
}
