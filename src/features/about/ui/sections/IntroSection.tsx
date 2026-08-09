import UmcSymbolMark from "@/shared/assets/image/about/UmcSymbolMark"
import UmcWordmark from "@/shared/assets/image/about/UmcWordmark"

import { ABOUT_INTRO } from "../../constants"

export function IntroSection() {
  return (
    <section className="flex flex-col items-center gap-25 pt-60 lg:gap-28 lg:pt-75">
      <div className="flex w-full flex-col items-center gap-8">
        <div className="flex flex-col items-start gap-6">
          <p className="w-full text-center text-[22px] leading-[20.8px] font-medium tracking-normal text-teal-400 uppercase">
            {ABOUT_INTRO.eyebrow}
          </p>
          <h2 className="flex flex-col items-center text-center text-[32px] leading-[1.2] font-bold tracking-[-0.64px] text-white lg:text-[38px] lg:tracking-[-0.76px] xl:text-[46px] xl:tracking-[-0.92px]">
            {ABOUT_INTRO.headlineLines.map((line) => (
              <span key={line}>{line}</span>
            ))}
          </h2>
        </div>
        <p className="text-teal-gray-400 max-w-250 text-center text-[22px] leading-[1.5] font-light tracking-[-0.66px] xl:text-2xl xl:tracking-[-0.72px]">
          {ABOUT_INTRO.description}
        </p>
      </div>

      <div className="flex items-center gap-16 lg:gap-18">
        <UmcSymbolMark className="h-[78.72px] w-[181.929px] text-[#F1F1F1] lg:h-24 lg:w-[221.863px]" />
        <UmcWordmark className="h-25 w-[220.344px] text-[#F1F1F1] lg:h-[122px] lg:w-[268.819px]" />
      </div>
    </section>
  )
}
