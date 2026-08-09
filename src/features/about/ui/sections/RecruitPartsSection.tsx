import { useState } from "react"

import { cn } from "@/shared/lib/utils"
import { GlassRim } from "@/shared/ui/GlassRim"

import { ABOUT_RECRUIT } from "../../constants"
import { GlassCtaButton } from "../GlassCtaButton"
import { glassSurface } from "../glassSurface"
import { PartCard } from "../PartCard"

const TRAIT_PANEL_SURFACE = glassSurface(166.7392, -18.091)

type PartId = (typeof ABOUT_RECRUIT.parts)[number]["id"]

export function RecruitPartsSection() {
  const [activePartId, setActivePartId] = useState<PartId>(
    ABOUT_RECRUIT.parts[0].id,
  )
  const activePart =
    ABOUT_RECRUIT.parts.find((part) => part.id === activePartId) ??
    ABOUT_RECRUIT.parts[0]

  return (
    <section className="flex flex-col items-center gap-13.5 pt-75">
      <div className="flex w-full flex-col items-start gap-25">
        <div className="flex w-full max-w-300 flex-col items-center gap-18">
          <div className="flex w-full flex-col items-center gap-6">
            <h2 className="text-center text-[38px] leading-[1.2] font-bold tracking-[-0.76px] text-white xl:text-5xl xl:tracking-[-1.44px]">
              {ABOUT_RECRUIT.headline}
            </h2>

            <p className="text-teal-gray-400 w-full text-center text-[22px] leading-normal font-light tracking-[-0.66px] xl:text-2xl xl:tracking-[-0.72px]">
              {ABOUT_RECRUIT.description}
            </p>
          </div>

          {/* 1024 는 2x2, 1440 은 한 줄이다. 양쪽 다 그리드로 두면 칸이 균등하게
              나뉘고 카드 높이도 함께 맞는다. */}
          <div className="grid w-full max-w-[780px] grid-cols-2 gap-7 xl:max-w-none xl:grid-cols-4">
            {ABOUT_RECRUIT.parts.map((part) => (
              <PartCard
                key={part.id}
                titleLines={part.titleLines}
                descriptionLines={part.descriptionLines}
              />
            ))}
          </div>
        </div>

        <div className="flex w-full flex-col items-center gap-7">
          <h3 className="w-full max-w-[780px] pl-1 text-center text-[32px] leading-[1.3] font-semibold text-white xl:max-w-none">
            {ABOUT_RECRUIT.traitsHeadline}
          </h3>

          <div className="flex w-full max-w-[780px] flex-col items-center gap-6.5 xl:max-w-none">
            <div role="tablist" className="flex items-center gap-3">
              {ABOUT_RECRUIT.parts.map((part) => {
                const isActive = part.id === activePart.id
                return (
                  <button
                    key={part.id}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    aria-controls="about-recruit-traits"
                    onClick={() => setActivePartId(part.id)}
                    className={cn(
                      "cursor-pointer rounded-full px-4.5 py-1.75 text-xl leading-[1.4] tracking-[-0.2px] transition-colors",
                      isActive
                        ? "bg-teal-900 text-white"
                        : "text-teal-gray-500 bg-[rgba(6,43,41,0.3)] hover:text-white",
                    )}
                  >
                    {part.tabLabel}
                  </button>
                )
              })}
            </div>

            <div
              id="about-recruit-traits"
              role="tabpanel"
              className="relative flex w-full items-center rounded-[30px] px-7 py-8"
              style={TRAIT_PANEL_SURFACE}
            >
              <GlassRim
                radius={30}
                from={0.101}
                to={0.174}
                bottomRight={0.174}
              />
              <ul className="text-teal-gray-300 relative min-h-24 w-full list-disc ps-7.5 text-xl leading-[1.6] tracking-[-0.2px]">
                {activePart.traits.map((trait) => (
                  <li key={trait}>{trait}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      <GlassCtaButton to={ABOUT_RECRUIT.ctaTo}>
        {ABOUT_RECRUIT.ctaLabel}
      </GlassCtaButton>
    </section>
  )
}
