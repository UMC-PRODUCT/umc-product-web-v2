import {
  GLOW_ELLIPSE_SRC,
  SOLUTION_LABEL,
  SOLUTION_MOCKUP_SRC,
  SOLUTION_SUBTITLE,
  SOLUTION_TITLE,
} from "../../constants"
import { GlowImage } from "../components/GlowImage"
import { SolutionTimeline } from "../components/SolutionTimeline"

const CIRCLE_GLOW_CENTER_X = 771.5
const CIRCLE_GLOW_CENTER_Y = 1479
const CIRCLE_GLOW_RX = 1444
const CIRCLE_GLOW_RY = 1321
const CIRCLE_GLOW_FADE_LEFT = 80
const CIRCLE_GLOW_FADE_RIGHT = 120
const CIRCLE_GLOW_FADE = `linear-gradient(to right, transparent, #000 ${CIRCLE_GLOW_FADE_LEFT}px, #000 calc(100% - ${CIRCLE_GLOW_FADE_RIGHT}px), transparent)`

const CIRCLE_GLOW = [
  `radial-gradient(ellipse ${CIRCLE_GLOW_RX}px ${CIRCLE_GLOW_RY}px at ${CIRCLE_GLOW_CENTER_X}px ${CIRCLE_GLOW_CENTER_Y}px,`,
  "rgba(229,245,242,0) 0%,",
  "rgba(229,245,242,0) 99.5%,",
  "rgba(229,245,242,0.2) 100%,",
  "rgba(229,245,242,0.125) 101.6%,",
  "rgba(229,245,242,0.065) 103.3%,",
  "rgba(229,245,242,0.025) 105%,",
  "rgba(229,245,242,0.009) 106.6%,",
  "rgba(229,245,242,0) 109%)",
].join(" ")

export function SolutionSection() {
  return (
    <section className="relative h-[1086px] w-[1440px] overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: CIRCLE_GLOW,
          maskImage: CIRCLE_GLOW_FADE,
          WebkitMaskImage: CIRCLE_GLOW_FADE,
        }}
        aria-hidden="true"
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
