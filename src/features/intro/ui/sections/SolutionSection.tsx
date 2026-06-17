import {
  GLOW_CIRCLE_SRC,
  GLOW_ELLIPSE_SRC,
  SOLUTION_LABEL,
  SOLUTION_MOCKUP_SRC,
  SOLUTION_SUBTITLE,
  SOLUTION_TITLE,
} from "../../constants"
import { GlowImage } from "../components/GlowImage"
import { SolutionTimeline } from "../components/SolutionTimeline"

export function SolutionSection() {
  return (
    <section className="relative h-[1086px] w-[1440px] overflow-hidden">
      <GlowImage
        src={GLOW_CIRCLE_SRC}
        left={-673}
        top={158}
        width={2889}
        height={2641}
        inset="-2.86% -3% -3.71% -3%"
      />
      <GlowImage
        src={GLOW_ELLIPSE_SRC}
        left={391}
        top={346}
        width={659}
        height={611}
        inset="-56.73% -52.6%"
      />

      <div className="absolute top-[285px] left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-[64px]">
        <div className="flex flex-col items-center gap-[32px]">
          <p className="text-[18px] leading-[1.4] font-semibold tracking-[-0.18px] text-[#0e8179]">
            {SOLUTION_LABEL}
          </p>
          <div className="text-center text-[32px] tracking-[-0.64px] text-white">
            <p className="leading-[1.25] font-bold whitespace-nowrap">
              {SOLUTION_TITLE}
            </p>
            <p className="leading-[1.6] font-normal">{SOLUTION_SUBTITLE}</p>
          </div>
        </div>
        <div className="flex flex-col items-center gap-[24px]">
          <img
            src={SOLUTION_MOCKUP_SRC}
            alt=""
            width={1273}
            height={379}
            loading="lazy"
            className="h-[379px] w-[1273px] max-w-none"
          />
          <SolutionTimeline />
        </div>
      </div>
    </section>
  )
}
