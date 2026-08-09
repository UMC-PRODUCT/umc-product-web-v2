import BreakTheRules from "@/shared/assets/image/about/BreakTheRules"
import BreakTheRulesStacked from "@/shared/assets/image/about/BreakTheRulesStacked"
import BreakTheRulesTriple from "@/shared/assets/image/about/BreakTheRulesTriple"

import { ABOUT_HERO } from "../../constants"
import { GlassCtaButton } from "../GlassCtaButton"

export function HeroSection() {
  return (
    <section className="flex items-center justify-center pt-70 pb-45 md:pt-85 md:pb-50 lg:pb-67.5">
      <div className="flex w-full flex-col items-center gap-6.5">
        <div className="flex w-full flex-col items-start gap-3 md:gap-6.5">
          <div className="flex w-full flex-col items-start gap-3.5 text-center md:gap-6.25">
            <p className="w-full text-base leading-[20.8px] font-medium tracking-[1px] text-teal-400 uppercase md:text-[22px] md:tracking-[2px]">
              {ABOUT_HERO.eyebrow}
            </p>
            <div className="flex h-48 w-full items-center justify-center md:h-50 lg:h-25">
              {/* 헤드라인은 글자를 접을 수 없는 벡터라 줄 수마다 파일이 다르다.
                  1024 부터 한 줄, 그 아래는 두 줄이다. */}
              <BreakTheRulesTriple
                className="h-auto w-full max-w-[199px] text-white md:hidden"
                role="img"
                aria-label={ABOUT_HERO.headlineAlt}
              />
              <BreakTheRulesStacked
                className="hidden h-auto w-full max-w-[506px] text-white md:block lg:hidden"
                role="img"
                aria-label={ABOUT_HERO.headlineAlt}
              />
              <BreakTheRules
                className="hidden h-auto w-full max-w-243.75 text-white lg:block"
                role="img"
                aria-label={ABOUT_HERO.headlineAlt}
              />
            </div>
          </div>
          <p className="text-teal-gray-400 w-full pt-0.5 pb-4.5 text-center text-base leading-6 font-light tracking-[-0.48px] md:text-[22px] md:leading-7 md:tracking-[-0.66px] xl:text-2xl xl:tracking-[-0.72px]">
            {ABOUT_HERO.descriptionLines.map((line, index) => (
              <span key={line}>
                {/* 1024 부터는 한 줄로 흐른다. 시안이 768 이하에서만 끊는다. */}
                {index > 0 && (
                  <>
                    {" "}
                    <br className="lg:hidden" />
                  </>
                )}
                {line}
              </span>
            ))}
          </p>
        </div>
        <GlassCtaButton to={ABOUT_HERO.ctaTo}>
          {ABOUT_HERO.ctaLabel}
        </GlassCtaButton>
      </div>
    </section>
  )
}
