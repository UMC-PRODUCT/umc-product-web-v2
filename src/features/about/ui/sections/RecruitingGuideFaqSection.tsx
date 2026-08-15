import { type KeyboardEvent, useRef, useState } from "react"

import DownChevronIcon from "@/shared/assets/icon/chevron/sidebar/DownChevronIcon"
import { cn } from "@/shared/lib/utils"
import { GlassRim } from "@/shared/ui/GlassRim"

import {
  RECRUITING_GUIDE_FAQ,
  type RecruitingGuideFaqFilterId,
  type RecruitingGuideFaqItem,
} from "../../recruitingGuideConstants"
import { GlassCtaButton } from "../GlassCtaButton"
import { glassSurface } from "../glassSurface"

const ITEM_SURFACE = glassSurface(166.7392, -18.091)

function FaqItem({ item }: { item: RecruitingGuideFaqItem }) {
  const [isOpen, setIsOpen] = useState(false)
  const panelId = `faq-panel-${item.id}`
  const triggerId = `faq-trigger-${item.id}`

  return (
    <li
      className="relative rounded-[20px] px-6 py-5 md:px-8 md:py-8.75"
      style={ITEM_SURFACE}
    >
      <GlassRim radius={20} from={0.101} to={0.174} bottomRight={0.174} />

      <h3 className="relative">
        <button
          type="button"
          id={triggerId}
          aria-expanded={isOpen}
          aria-controls={panelId}
          onClick={() => setIsOpen((open) => !open)}
          // 어두운 배경에서는 브라우저 기본 초점 테두리가 거의 보이지 않는다.
          className="flex w-full cursor-pointer items-center gap-3 rounded-[12px] text-left outline-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-300 md:gap-4"
        >
          <span
            aria-hidden
            className="shrink-0 text-xl font-bold text-teal-300"
          >
            Q
          </span>
          <span className="min-w-0 flex-1 text-lg leading-[1.4] font-semibold tracking-[-0.36px] text-white md:text-xl md:tracking-[-0.4px]">
            {item.question}
          </span>
          <DownChevronIcon
            aria-hidden
            className={cn(
              "text-teal-gray-400 size-6 shrink-0 transition-transform duration-200",
              isOpen && "rotate-180",
            )}
          />
        </button>
      </h3>

      {/* 높이를 모르는 본문을 여닫으려면 격자 행을 0fr↔1fr 로 움직인다. hidden
          이나 max-height 로는 각각 애니메이션이 없거나 본문 길이에 따라 속도가
          들쭉날쭉해진다.
          접힌 동안에는 inert 로 초점과 낭독에서 함께 빼낸다. 눈에 안 보이는 문장이
          계속 읽히거나 Tab 으로 걸리면 안 된다. */}
      <div
        id={panelId}
        role="region"
        aria-labelledby={triggerId}
        inert={!isOpen}
        className={cn(
          "relative grid transition-[grid-template-rows] duration-300 ease-out motion-reduce:transition-none",
          isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
        )}
      >
        <div className="overflow-hidden">
          <div className="text-teal-gray-300 pt-4 pl-7 text-base leading-[1.6] tracking-[-0.32px] whitespace-pre-line md:pl-9">
            {item.answer}
          </div>
        </div>
      </div>
    </li>
  )
}

export function RecruitingGuideFaqSection() {
  const [activeFilterId, setActiveFilterId] =
    useState<RecruitingGuideFaqFilterId>("all")
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([])

  // 탭 묶음은 화살표로 옮겨 다니는 것이 기본 동작이다. role 만 붙이고 두면
  // 화면 낭독기 사용자에게는 탭이라고 알려 놓고 실제로는 움직이지 않는다.
  const moveTab = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const last = RECRUITING_GUIDE_FAQ.filters.length - 1
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
    const target =
      next === null ? undefined : RECRUITING_GUIDE_FAQ.filters[next]
    if (!target) return

    event.preventDefault()
    setActiveFilterId(target.id)
    tabRefs.current[next as number]?.focus()
  }

  const visibleItems = RECRUITING_GUIDE_FAQ.items.filter((item) =>
    activeFilterId === "all"
      ? item.parts.length === 0
      : item.parts.some((part) => part === activeFilterId),
  )

  return (
    <section className="flex flex-col items-center gap-13.5 pt-37.5 pb-40 md:pt-60 lg:pt-75">
      <div className="flex w-full flex-col items-center gap-16 lg:gap-18">
        <div className="flex w-full flex-col items-center gap-3 md:gap-4">
          <p className="w-full text-center text-base leading-[20.8px] font-medium tracking-[1px] text-teal-400 uppercase md:text-[22px] md:tracking-[2px]">
            {RECRUITING_GUIDE_FAQ.eyebrow}
          </p>
          <h2 className="text-center text-[30px] leading-[1.2] font-bold tracking-[-0.6px] text-white md:text-[32px] md:tracking-[-0.64px] lg:text-[38px] lg:tracking-[-0.76px] xl:text-5xl xl:tracking-[-1.44px]">
            {RECRUITING_GUIDE_FAQ.headline}
          </h2>
        </div>

        <div className="flex w-full max-w-284 flex-col items-center gap-6.5">
          {/* 좁은 화면에서는 칩 다섯 개가 한 줄에 들어가지 않는다. 한 줄을
              유지하고 넘치면 이 줄만 가로로 민다. */}
          <div className="scrollbar-hide w-full overflow-x-auto">
            <div
              role="tablist"
              aria-label={RECRUITING_GUIDE_FAQ.headline}
              className="mx-auto flex w-max items-center gap-3"
            >
              {RECRUITING_GUIDE_FAQ.filters.map((filter, index) => {
                const isActive = filter.id === activeFilterId
                return (
                  <button
                    key={filter.id}
                    type="button"
                    role="tab"
                    id={`faq-tab-${filter.id}`}
                    ref={(node) => {
                      tabRefs.current[index] = node
                    }}
                    aria-selected={isActive}
                    aria-controls="faq-panel"
                    tabIndex={isActive ? 0 : -1}
                    onKeyDown={(event) => moveTab(event, index)}
                    onClick={() => setActiveFilterId(filter.id)}
                    className={cn(
                      "shrink-0 cursor-pointer rounded-full px-4.5 py-1.75 text-xl leading-[1.4] tracking-[-0.2px] transition-colors outline-none",
                      "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-300",
                      isActive
                        ? "bg-teal-900 text-white"
                        : "text-teal-gray-500 bg-[rgba(6,43,41,0.3)] hover:text-white",
                    )}
                  >
                    {filter.label}
                  </button>
                )
              })}
            </div>
          </div>

          <div
            id="faq-panel"
            role="tabpanel"
            aria-labelledby={`faq-tab-${activeFilterId}`}
            className="w-full"
          >
            {visibleItems.length === 0 ? (
              <p className="text-teal-gray-400 py-10 text-center text-base">
                {RECRUITING_GUIDE_FAQ.emptyMessage}
              </p>
            ) : (
              <ul className="flex w-full flex-col gap-6.5">
                {visibleItems.map((item) => (
                  <FaqItem key={item.id} item={item} />
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      <GlassCtaButton to={RECRUITING_GUIDE_FAQ.ctaTo}>
        {RECRUITING_GUIDE_FAQ.ctaLabel}
      </GlassCtaButton>
    </section>
  )
}
