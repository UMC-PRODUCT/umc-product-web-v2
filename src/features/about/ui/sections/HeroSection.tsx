import BreakTheRules from "@/shared/assets/image/about/BreakTheRules"
import BreakTheRulesStacked from "@/shared/assets/image/about/BreakTheRulesStacked"
import BreakTheRulesTriple from "@/shared/assets/image/about/BreakTheRulesTriple"

import { ABOUT_HERO } from "../../constants"
import { GlassCtaButton } from "../GlassCtaButton"

export function HeroSection() {
  return (
    <section className="flex items-center justify-center pt-70 pb-45 md:pt-90 md:pb-50 lg:px-12 lg:pb-67.5">
      <div className="flex w-full flex-col items-center gap-6.5">
        <div className="flex w-full flex-col items-start gap-3 md:gap-6.5">
          <div className="flex w-full flex-col items-start gap-3.5 text-center md:gap-6.25">
            <p className="w-full text-base leading-[20.8px] font-medium tracking-[1px] text-teal-400 uppercase md:text-[22px] md:tracking-[2px]">
              {ABOUT_HERO.eyebrow}
            </p>
            {/* 390~767 은 폭에 따라 벡터가 커져 칸을 고정하면 넘친다. 최소
                높이만 잡고 벡터가 칸을 정하게 둔다. 나머지 구간은 벡터 최대
                크기가 칸 안에 들어가 시안대로 고정해도 된다. */}
            <div className="xs:h-auto xs:min-h-32 flex h-48 w-full items-center justify-center md:h-50 lg:h-25 lg:min-h-0">
              {/* 헤드라인은 글자를 접을 수 없는 벡터라 줄 수마다 파일이 다르다.
                  1024 부터 한 줄, 그 아래는 두 줄이다. */}
              <BreakTheRulesTriple
                className="xs:hidden h-auto w-full max-w-[199px] text-white"
                role="img"
                aria-label={ABOUT_HERO.headlineAlt}
              />
              <BreakTheRulesStacked
                className="xs:block hidden h-auto w-full max-w-[506px] text-white lg:hidden"
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
          <p className="text-teal-gray-400 font-suit w-full pt-0.5 pb-4.5 text-center text-base leading-6 font-light tracking-[-0.48px] md:text-[22px] md:leading-7 md:tracking-[-0.66px] xl:text-2xl xl:tracking-[-0.72px]">
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
