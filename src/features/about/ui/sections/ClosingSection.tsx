import UmcEleventh from "@/shared/assets/image/about/UmcEleventh"

import { ABOUT_CLOSING } from "../../constants"
import { GlassCtaButton } from "../GlassCtaButton"

export function ClosingSection() {
  return (
    <section className="flex flex-col items-center gap-6.5 pt-75 pb-40">
      <div className="flex w-full flex-col items-center gap-6.5">
        <div className="flex flex-col items-start gap-4 text-center lg:gap-6.25">
          <p className="w-full text-[22px] leading-[20.8px] font-medium tracking-[2px] text-teal-400 uppercase">
            {ABOUT_CLOSING.eyebrow}
          </p>
          {/* 시안의 텍스트 박스는 102px 인데 글자 잉크는 76px 이다. 위아래 여백을
              맞춰야 아래 설명과의 간격이 시안과 같아진다. */}
          <div className="flex h-25 items-center lg:h-25.5">
            <UmcEleventh
              className="h-19 w-112.5 text-white"
              role="img"
              aria-label={ABOUT_CLOSING.headline}
            />
          </div>
        </div>
        <p className="text-teal-gray-400 w-full pt-0.5 pb-4.5 text-center text-[22px] leading-7 font-light tracking-[-0.66px] xl:text-2xl xl:tracking-[-0.72px]">
          {ABOUT_CLOSING.descriptionLines.map((line, index) => (
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
      <GlassCtaButton tone="primary" to={ABOUT_CLOSING.ctaTo}>
        {ABOUT_CLOSING.ctaLabel}
      </GlassCtaButton>
    </section>
  )
}
