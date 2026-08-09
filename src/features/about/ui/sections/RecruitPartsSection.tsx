import { type KeyboardEvent, useRef, useState } from "react"

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

  const tabRefs = useRef<(HTMLButtonElement | null)[]>([])

  // 탭 위젯은 화살표로 옮겨 다니는 것이 기본 동작이다. role 만 붙이고 두면
  // 화면 낭독기 사용자에게는 탭이라고 알려 놓고 실제로는 움직이지 않는다.
  const moveTab = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const last = ABOUT_RECRUIT.parts.length - 1
    const next =
      event.key === "ArrowRight"
        ? index === last
          ? 0
          : index + 1
        : event.key === "ArrowLeft"
          ? index === 0
            ? last
            : index - 1
          : event.key === "Home"
            ? 0
            : event.key === "End"
              ? last
              : null
    const target = next === null ? undefined : ABOUT_RECRUIT.parts[next]
    if (!target) return

    event.preventDefault()
    setActivePartId(target.id)
    tabRefs.current[next as number]?.focus()
  }

  return (
    <section className="flex flex-col items-center gap-13.5 pt-37.5 md:pt-60 lg:pt-75">
      <div className="flex w-full flex-col items-start gap-25">
        <div className="flex w-full max-w-300 flex-col items-center gap-16 lg:gap-18">
          <div className="flex w-full flex-col items-center gap-6">
            <h2 className="text-center text-[30px] leading-[1.2] font-bold tracking-[-0.6px] text-white md:text-[32px] md:tracking-[-0.64px] lg:text-[38px] lg:tracking-[-0.76px] xl:text-5xl xl:tracking-[-1.44px]">
              {ABOUT_RECRUIT.headline}
            </h2>

            <p className="text-teal-gray-400 font-suit w-full text-center text-base leading-normal font-light tracking-[-0.48px] md:text-[22px] md:tracking-[-0.66px] xl:text-2xl xl:tracking-[-0.72px]">
              {ABOUT_RECRUIT.descriptionLines.map((line, index) => (
                <span
                  key={line}
                  // 390~1023 만 두 줄로 끊는다. 나머지 구간은 한 줄로 흐르다
                  // 폭이 모자라면 알아서 접힌다.
                  className={index > 0 ? undefined : "xs:block lg:inline"}
                >
                  {line}
                  {index === 0 && " "}
                </span>
              ))}
            </p>
          </div>

          {/* 1024 는 2x2, 1440 은 한 줄이다. 양쪽 다 그리드로 두면 칸이 균등하게
              나뉘고 카드 높이도 함께 맞는다. */}
          <div className="grid w-full max-w-[279px] grid-cols-1 gap-7 md:max-w-[586px] md:grid-cols-2 lg:max-w-[780px] xl:max-w-none xl:grid-cols-4">
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
          <h3 className="w-full text-center text-[30px] leading-[1.2] font-semibold text-white md:max-w-[576px] md:text-[32px] md:leading-[1.3] lg:max-w-[780px] lg:pl-1 xl:max-w-none">
            {ABOUT_RECRUIT.traitsHeadline}
          </h3>

          <div className="flex w-full flex-col items-center gap-6.5 md:max-w-[576px] lg:max-w-[780px] xl:max-w-none">
            {/* 좁은 화면에서는 칩 네 개가 한 줄에 들어가지 않는다. 한 줄을
                유지하고 넘치면 이 줄만 가로로 민다.
                안쪽을 w-max + mx-auto 로 둔다. 바깥에 justify-center 를 주면
                넘칠 때 왼쪽이 잘린 채 그쪽으로 스크롤되지 않는다. */}
            <div className="scrollbar-hide w-full overflow-x-auto">
              <div
                role="tablist"
                className="mx-auto flex w-max items-center gap-3"
              >
                {ABOUT_RECRUIT.parts.map((part, index) => {
                  const isActive = part.id === activePart.id
                  return (
                    <button
                      key={part.id}
                      type="button"
                      role="tab"
                      id={`about-recruit-tab-${part.id}`}
                      ref={(node) => {
                        tabRefs.current[index] = node
                      }}
                      aria-selected={isActive}
                      aria-controls="about-recruit-traits"
                      // 탭 묶음은 Tab 키 한 번에 통째로 지나간다. 안쪽 이동은
                      // 화살표가 맡는다.
                      tabIndex={isActive ? 0 : -1}
                      onKeyDown={(event) => moveTab(event, index)}
                      onClick={() => setActivePartId(part.id)}
                      className={cn(
                        "shrink-0 cursor-pointer rounded-full px-4.5 py-1.75 text-xl leading-[1.4] tracking-[-0.2px] transition-colors",
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
            </div>

            <div
              id="about-recruit-traits"
              role="tabpanel"
              aria-labelledby={`about-recruit-tab-${activePart.id}`}
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
