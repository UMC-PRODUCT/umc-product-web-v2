import BreakTheRules from "@/shared/assets/image/about/BreakTheRules"

import { ABOUT_HERO } from "../../constants"
import { GlassCtaButton } from "../GlassCtaButton"

export function HeroSection() {
  return (
    <section className="flex items-center justify-center pt-85 pb-67.5">
      <div className="flex flex-col items-center gap-6.5">
        <div className="flex w-full flex-col items-start gap-6.5">
          <div className="flex flex-col items-start gap-6.25 text-center">
            <p className="w-full text-[22px] leading-[20.8px] font-medium tracking-[2px] text-teal-400 uppercase">
              {ABOUT_HERO.eyebrow}
            </p>
            <div className="flex h-25 items-center">
              <BreakTheRules
                className="h-auto w-full max-w-243.75 text-white"
                role="img"
                aria-label={ABOUT_HERO.headlineAlt}
              />
            </div>
          </div>
          <p className="text-teal-gray-400 w-full pt-0.5 pb-4.5 text-center text-[22px] leading-7 font-light tracking-[-0.66px] xl:text-2xl xl:tracking-[-0.72px]">
            {ABOUT_HERO.description}
          </p>
        </div>
        <GlassCtaButton to={ABOUT_HERO.ctaTo}>
          {ABOUT_HERO.ctaLabel}
        </GlassCtaButton>
      </div>
    </section>
  )
}
