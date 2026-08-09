import { cn } from "@/shared/lib/utils"

import { ABOUT_SCHOOLS } from "../../constants"
import { GlassCtaButton } from "../GlassCtaButton"
import { SchoolChip } from "../SchoolChip"

function SchoolTrack() {
  return (
    <ul className="flex">
      {ABOUT_SCHOOLS.schools.map((school) => (
        <li key={school.name} className="pr-5">
          <SchoolChip name={school.name} logo={school.logo} />
        </li>
      ))}
    </ul>
  )
}

function SchoolMarqueeRow({ direction }: { direction: "left" | "right" }) {
  return (
    <div
      className={cn(
        "flex w-max",
        direction === "left"
          ? "animate-school-marquee-left"
          : "animate-school-marquee-right",
      )}
    >
      <SchoolTrack />
      <div aria-hidden>
        <SchoolTrack />
      </div>
    </div>
  )
}

export function SchoolsSection() {
  return (
    <section className="flex flex-col items-center gap-26 pt-75 xl:gap-30">
      <div className="flex w-full flex-col items-center gap-18">
        <div className="flex w-full max-w-270 flex-col items-center gap-6">
          <h2 className="text-center text-[38px] leading-[1.2] font-bold tracking-[-0.76px] text-white xl:text-5xl xl:tracking-[-1.44px]">
            {ABOUT_SCHOOLS.headline}
          </h2>
          <p className="text-teal-gray-400 flex max-w-250 flex-col text-center text-[22px] leading-normal font-light tracking-[-0.66px] xl:text-2xl xl:tracking-[-0.72px]">
            {ABOUT_SCHOOLS.descriptionLines.map((line) => (
              <span key={line}>{line}</span>
            ))}
          </p>
        </div>
        {/* 학교줄은 콘텐츠 폭을 넘어 화면 끝까지 흐른다. 부모가 items-center 라
            폭만 늘리면 가운데를 기준으로 양옆으로 똑같이 번져 나간다. */}
        <div className="flex w-screen flex-col gap-7.5 overflow-hidden">
          <SchoolMarqueeRow direction="right" />
          <div aria-hidden>
            <SchoolMarqueeRow direction="left" />
          </div>
        </div>
      </div>

      <GlassCtaButton to={ABOUT_SCHOOLS.ctaTo}>
        {ABOUT_SCHOOLS.ctaLabel}
      </GlassCtaButton>
    </section>
  )
}
