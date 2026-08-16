import { cn } from "@/shared/lib/utils"

import { ABOUT_SCHOOLS } from "../../constants"
import { GlassCtaButton } from "../GlassCtaButton"
import { SchoolChip } from "../SchoolChip"

function SchoolTrack() {
  return (
    <ul className="flex">
      {ABOUT_SCHOOLS.schools.map((school) => (
        <li key={school.name} className="pr-2 md:pr-5">
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

interface SchoolsSectionProps {
  headline?: string
  descriptionLines?: readonly string[]
  /**
   * 학교줄을 흘릴지(marquee) 그대로 세울지(static).
   *
   * 소개 랜딩은 흐르는 줄로 규모를 보여 주고, 모집 안내는 지원할 학교를 찾는
   * 자리라 멈춰 있어야 눈으로 훑을 수 있다.
   */
  variant?: "marquee" | "static"
  /** CTA 를 두지 않는 화면이 있어 함께 비울 수 있게 한다. */
  cta?: { label: string; to: string } | null
}

export function SchoolsSection({
  headline = ABOUT_SCHOOLS.headline,
  descriptionLines = ABOUT_SCHOOLS.descriptionLines,
  variant = "marquee",
  cta = { label: ABOUT_SCHOOLS.ctaLabel, to: ABOUT_SCHOOLS.ctaTo },
}: SchoolsSectionProps = {}) {
  return (
    <section className="flex flex-col items-center gap-22 pt-37.5 md:pt-60 lg:gap-26 lg:pt-75 xl:gap-30">
      <div className="flex w-full flex-col items-center gap-16 lg:gap-18">
        <div className="flex w-full max-w-270 flex-col items-center gap-6">
          <h2 className="text-center text-[30px] leading-[1.2] font-bold tracking-[-0.6px] text-white md:text-[32px] md:tracking-[-0.64px] lg:text-[38px] lg:tracking-[-0.76px] xl:text-5xl xl:tracking-[-1.44px]">
            {headline}
          </h2>
          <p className="text-teal-gray-400 font-suit flex max-w-250 flex-col text-center text-base leading-normal font-light tracking-[-0.48px] md:text-[22px] md:tracking-[-0.66px] xl:text-2xl xl:tracking-[-0.72px]">
            {descriptionLines.map((line) => (
              <span key={line}>{line}</span>
            ))}
          </p>
        </div>
        {variant === "static" ? (
          <ul className="flex flex-wrap justify-center gap-x-2 gap-y-6 md:gap-x-5 md:gap-y-7.5">
            {ABOUT_SCHOOLS.schools.map((school) => (
              <li key={school.name}>
                <SchoolChip name={school.name} logo={school.logo} />
              </li>
            ))}
          </ul>
        ) : (
          // 학교줄은 콘텐츠 폭을 넘어 화면 끝까지 흐른다. 부모가 items-center 라
          // 폭만 늘리면 가운데를 기준으로 양옆으로 똑같이 번져 나간다.
          <div className="flex w-screen flex-col gap-6 overflow-hidden md:gap-7.5">
            <SchoolMarqueeRow direction="right" />
            <div aria-hidden>
              <SchoolMarqueeRow direction="left" />
            </div>
          </div>
        )}
      </div>

      {cta && <GlassCtaButton to={cta.to}>{cta.label}</GlassCtaButton>}
    </section>
  )
}
