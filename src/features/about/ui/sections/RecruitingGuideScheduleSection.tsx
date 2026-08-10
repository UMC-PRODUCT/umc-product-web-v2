import { GlassRim } from "@/shared/ui/GlassRim"

import { RECRUITING_GUIDE_SCHEDULE } from "../../recruitingGuideConstants"
import { GlassCtaButton } from "../GlassCtaButton"
import { glassSurface } from "../glassSurface"

const SCHEDULE_SURFACE = glassSurface(166.7392, -18.091)

export function RecruitingGuideScheduleSection() {
  const lastIndex = RECRUITING_GUIDE_SCHEDULE.steps.length - 1

  return (
    <section className="flex flex-col items-center gap-13.5 pt-37.5 md:pt-60 lg:pt-75">
      <div className="flex w-full flex-col items-center gap-16 lg:gap-18">
        <div className="flex w-full flex-col items-center gap-6">
          <h2 className="text-center text-[30px] leading-[1.2] font-bold tracking-[-0.6px] text-white md:text-[32px] md:tracking-[-0.64px] lg:text-[38px] lg:tracking-[-0.76px] xl:text-5xl xl:tracking-[-1.44px]">
            {RECRUITING_GUIDE_SCHEDULE.headline}
          </h2>
          <p className="text-teal-gray-400 font-suit text-center text-base leading-normal font-light tracking-[-0.48px] md:text-[22px] md:tracking-[-0.66px] xl:text-2xl xl:tracking-[-0.72px]">
            {RECRUITING_GUIDE_SCHEDULE.description}
          </p>
        </div>

        <div
          className="relative w-full max-w-188.75 rounded-[30px] px-6 py-10 md:px-21.5 md:pt-14 md:pb-17"
          style={SCHEDULE_SURFACE}
        >
          <GlassRim radius={30} from={0.101} to={0.174} bottomRight={0.174} />

          {/* 차례가 있는 절차라 목록 자체가 순서를 들고 있어야 한다. 점과 세로선은
              그 순서를 눈으로 보여 줄 뿐이라 읽히지 않게 둔다. */}
          <ol className="relative flex flex-col">
            {RECRUITING_GUIDE_SCHEDULE.steps.map((step, index) => (
              <li key={step.title} className="relative flex gap-6">
                <span
                  aria-hidden
                  className="relative flex w-2.5 shrink-0 justify-center"
                >
                  <span className="mt-2.5 size-2.5 shrink-0 rounded-full bg-teal-400" />
                  {/* 세로선은 마지막 점 아래로 내려가지 않는다. 끝난 절차 뒤에
                      선이 남으면 다음 단계가 더 있는 것처럼 보인다. */}
                  {index < lastIndex && (
                    <span className="absolute top-5 bottom-0 w-px bg-teal-400/40" />
                  )}
                </span>

                <div
                  className={`flex min-w-0 flex-1 flex-col gap-1 md:flex-row md:items-baseline md:gap-6 ${
                    index < lastIndex ? "pb-7.5" : ""
                  }`}
                >
                  <span className="shrink-0 text-lg leading-[1.4] font-semibold tracking-[-0.36px] text-teal-300 md:w-34 md:text-xl md:tracking-[-0.4px]">
                    {step.title}
                  </span>
                  <span className="flex min-w-0 items-baseline gap-6">
                    <span
                      aria-hidden
                      className="hidden h-4.5 w-px shrink-0 self-center bg-white/20 md:block"
                    />
                    <span className="text-teal-gray-300 min-w-0 text-base leading-[1.5] tracking-[-0.32px] md:text-xl md:tracking-[-0.4px]">
                      {step.description}
                    </span>
                  </span>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>

      <GlassCtaButton to={RECRUITING_GUIDE_SCHEDULE.ctaTo}>
        {RECRUITING_GUIDE_SCHEDULE.ctaLabel}
      </GlassCtaButton>
    </section>
  )
}
