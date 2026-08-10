import UmcEleventh from "@/shared/assets/image/about/UmcEleventh"

import { RECRUITING_GUIDE_HERO } from "../../recruitingGuideConstants"
import { GlassCtaButton } from "../GlassCtaButton"

export function RecruitingGuideHeroSection() {
  return (
    <section className="flex flex-col items-center gap-6.5 pt-70 pb-45 md:pt-90 md:pb-50 lg:pb-67.5">
      <div className="flex w-full flex-col items-center gap-3 md:gap-6.5">
        <div className="flex flex-col items-start gap-3.5 text-center md:gap-4 lg:gap-6.25">
          <p className="w-full text-base leading-[20.8px] font-medium tracking-[1px] text-teal-400 uppercase md:text-[22px] md:tracking-[2px]">
            {RECRUITING_GUIDE_HERO.eyebrow}
          </p>
          {/* 헤드라인은 글자를 접을 수 없는 벡터다. 마무리 섹션과 같은 칸 높이를
              써서 두 화면의 UMC 11th 가 같은 크기로 보이게 한다. */}
          <div className="flex h-16 w-full items-center justify-center md:h-25 lg:h-25.5">
            <UmcEleventh
              className="h-auto w-full max-w-112.5 text-white"
              role="img"
              aria-label={RECRUITING_GUIDE_HERO.headline}
            />
          </div>
        </div>
        <p className="text-teal-gray-400 font-suit w-full pt-0.5 pb-4.5 text-center text-base leading-6 font-light tracking-[-0.48px] md:text-[22px] md:leading-7 md:tracking-[-0.66px] xl:text-2xl xl:tracking-[-0.72px]">
          {RECRUITING_GUIDE_HERO.description}
        </p>
      </div>
      <GlassCtaButton to={RECRUITING_GUIDE_HERO.ctaTo}>
        {RECRUITING_GUIDE_HERO.ctaLabel}
      </GlassCtaButton>
    </section>
  )
}
