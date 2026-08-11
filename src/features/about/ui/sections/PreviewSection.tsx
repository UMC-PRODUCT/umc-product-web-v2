import { type KeyboardEvent, type PointerEvent, useRef, useState } from "react"

import { cn } from "@/shared/lib/utils"

import { ABOUT_PREVIEW } from "../../constants"
import { glassSurface } from "../glassSurface"

import type { CSSProperties } from "react"

const CARD_SURFACE = glassSurface(135.6984, -53.5277)

/**
 * 선택된 탭의 면. 카드 표면과 같은 이유로 mix-blend 가 아니라 background-blend 다.
 * mix-blend 를 쓰면 카드가 히어로 글로우 위에 놓일 때만 탭이 밝게 뜬다.
 */
const ACTIVE_TAB_SURFACE: CSSProperties = {
  background: [
    "linear-gradient(0deg, rgba(199, 235, 230, 0.1), rgba(199, 235, 230, 0.1))",
    "linear-gradient(0deg, rgba(38, 38, 38, 0.2), rgba(38, 38, 38, 0.2))",
    "rgba(0, 0, 0, 0.004)",
  ].join(", "),
  backgroundBlendMode: "normal, color-dodge, normal",
}

const ITEMS = ABOUT_PREVIEW.items

/**
 * 시안의 화살표. 채워진 path 라 선 굵기가 lucide 와 달라 그대로 옮긴다.
 * 오른쪽 모양이 원본이고 왼쪽은 180 도 돌려 쓴다.
 */
function Chevron({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 9.50285 17.0025"
      fill="currentColor"
      aria-hidden
      className={className}
    >
      <path d="M0.292894 0.29285C0.683365 -0.0976614 1.3164 -0.0975721 1.70696 0.29285L9.20989 7.79383C9.39735 7.98129 9.50278 8.23575 9.50285 8.50086C9.50284 8.76598 9.3973 9.02038 9.20989 9.20789L1.70696 16.7098C1.31645 17.1 0.683314 17.1001 0.292894 16.7098C-0.097594 16.3193 -0.0976684 15.6853 0.292894 15.2948L7.08879 8.50086L0.292894 1.70691C-0.0974617 1.31643 -0.0974769 0.683353 0.292894 0.29285Z" />
    </svg>
  )
}

/** 이보다 적게 끌면 세로 스크롤을 하다 손가락이 흔들린 것으로 본다. */
const SWIPE_THRESHOLD = 40

export function PreviewSection() {
  const [index, setIndex] = useState(0)
  // 인덱스 접근은 noUncheckedIndexedAccess 로 undefined 가 섞인다. 범위를 벗어날
  // 일은 없지만 타입을 좁히려면 첫 항목으로 떨어뜨려야 한다.
  const active = ITEMS[index] ?? ITEMS[0]
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([])

  const last = ITEMS.length - 1
  // 시안이 첫 항목에서 이전 화살표를 흐리게 두었다. 끝에서 순환하지 않고 멈춘다.
  const clamp = (next: number) => Math.min(Math.max(next, 0), last)

  const dragStart = useRef<{ x: number; y: number } | null>(null)

  // 끌어서 넘기는 동작은 좌측 탭이 없는 구간에서만 쓴다. 탭이 보이는데 사진까지
  // 끌리면 조작한 적 없는 변화로 읽힌다.
  //
  // 포인터 종류(touch/mouse)로 가르지 않는다. 크롬 기기 모드처럼 마우스를 터치로
  // 흉내 내는 환경마다 pointerType 이 갈려서, 정작 확인하는 화면에서 안 먹는다.
  const startDrag = (event: PointerEvent<HTMLDivElement>) => {
    if (!window.matchMedia("(max-width: 767px)").matches) return

    // 포인터를 이 요소에 묶어 둔다. 손가락은 브라우저가 알아서 묶어 주지만 마우스는
    // 아니라, 끌다가 패널 밖에서 손을 떼면 pointerup 이 다른 요소로 가 넘김이
    // 통째로 사라진다. 패널이 390 에서 294px 뿐이라 조금만 크게 끌어도 벗어난다.
    event.currentTarget.setPointerCapture(event.pointerId)
    dragStart.current = { x: event.clientX, y: event.clientY }
  }

  // 손을 뗄 때가 아니라 끄는 도중에 판정한다. 브라우저가 제스처를 세로 스크롤로
  // 가져가기로 하면 pointercancel 을 보내고 pointerup 은 오지 않는데, 뗄 때까지
  // 기다리면 그 판정이 통째로 사라진다. 문턱을 넘은 순간 넘겨 버리면 그 뒤에 무슨
  // 이벤트가 오든 상관이 없다.
  const moveDrag = (event: PointerEvent<HTMLDivElement>) => {
    const start = dragStart.current
    if (!start) return

    const dx = event.clientX - start.x
    const dy = event.clientY - start.y
    // 세로로 더 많이 움직였으면 넘기려던 것이 아니라 스크롤이다.
    if (Math.abs(dx) < SWIPE_THRESHOLD || Math.abs(dx) <= Math.abs(dy)) return

    // 한 번 끌 때 한 칸만 넘어가게 시작점을 비운다.
    dragStart.current = null
    setIndex((current) => clamp(dx < 0 ? current + 1 : current - 1))
  }

  const endDrag = () => {
    dragStart.current = null
  }

  // 세로로 늘어선 탭이라 화살표도 위아래가 기본이다. role 만 붙이고 두면 화면
  // 낭독기에 탭이라고 알려 놓고 실제로는 움직이지 않는다.
  const moveTab = (event: KeyboardEvent<HTMLButtonElement>, from: number) => {
    const next =
      event.key === "ArrowDown"
        ? clamp(from + 1)
        : event.key === "ArrowUp"
          ? clamp(from - 1)
          : event.key === "Home"
            ? 0
            : event.key === "End"
              ? last
              : null
    if (next === null) return

    event.preventDefault()
    setIndex(next)
    tabRefs.current[next]?.focus()
  }

  return (
    <section className="flex flex-col items-center gap-11 pt-37.5 md:pt-60 lg:pt-75">
      <div className="flex w-full max-w-300 flex-col items-center gap-6">
        <h2 className="text-center text-[30px] leading-[1.2] font-bold tracking-[-0.6px] text-white md:text-[32px] md:tracking-[-0.64px] lg:text-[38px] lg:tracking-[-0.76px] xl:text-5xl xl:tracking-[-1.44px]">
          {ABOUT_PREVIEW.headline}
        </h2>
        <p className="text-teal-gray-400 font-suit w-full text-center text-base leading-normal font-light tracking-[-0.48px] md:text-[22px] md:tracking-[-0.66px] xl:text-2xl xl:tracking-[-0.72px]">
          {ABOUT_PREVIEW.description}
        </p>
      </div>

      <div
        className="w-full max-w-300 rounded-[28px] p-4 md:rounded-[30px] md:p-8"
        style={CARD_SURFACE}
      >
        {/* 768 부터는 좌측 세로 탭, 그 아래로는 상단 이름표 + 하단 페이지네이션이다.
            조작 UI 만 두 벌이고 현재 항목은 하나라 index 를 함께 쓴다. */}
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:gap-0">
          <div
            role="tablist"
            aria-orientation="vertical"
            aria-label={ABOUT_PREVIEW.headline}
            className="hidden md:flex md:shrink-0 md:flex-col md:gap-2 md:self-stretch md:pt-2 md:pr-4"
          >
            {ITEMS.map((item, i) => (
              <button
                key={item.id}
                ref={(node) => {
                  tabRefs.current[i] = node
                }}
                type="button"
                role="tab"
                id={`preview-tab-${item.id}`}
                aria-selected={i === index}
                aria-controls={`preview-panel-${item.id}`}
                tabIndex={i === index ? 0 : -1}
                onClick={() => setIndex(i)}
                onKeyDown={(event) => moveTab(event, i)}
                className={cn(
                  "flex h-11 cursor-pointer items-center justify-center rounded-[12px] px-4.5 text-lg leading-[1.4] font-medium tracking-[-0.18px] whitespace-nowrap",
                  i === index ? "text-teal-200" : "text-teal-gray-600",
                )}
                style={i === index ? ACTIVE_TAB_SURFACE : undefined}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* 모바일 이름표. 탭 목록을 대신하므로 누를 수 없고, 현재 항목만 알린다. */}
          <div
            className="flex h-11 items-center justify-center rounded-[12px] px-4.5 md:hidden"
            style={ACTIVE_TAB_SURFACE}
          >
            <span className="text-lg leading-[1.4] font-medium tracking-[-0.18px] whitespace-nowrap text-teal-200">
              {active.label}
            </span>
          </div>

          <div
            id={`preview-panel-${active.id}`}
            role="tabpanel"
            aria-labelledby={`preview-tab-${active.id}`}
            onPointerDown={startDrag}
            onPointerMove={moveDrag}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
            // 가로 제스처는 우리가 처리하고 세로 스크롤은 브라우저에 넘긴다.
            className="flex min-w-px touch-pan-y flex-col gap-2.5 md:min-w-px md:flex-1 md:gap-4 md:px-6.5"
          >
            {/* 브라우저 기본 이미지 끌기가 켜져 있으면 넘기려던 동작이 그림 끌기로
                가로채여 pointerup 이 오지 않는다. */}
            <img
              src={active.image}
              alt={active.label}
              loading="lazy"
              decoding="async"
              draggable={false}
              className="aspect-[504/296] w-full object-cover select-none"
            />
            {/* 문장마다 줄을 나눈다. 이어 붙이면 한 덩어리로 읽혀 활동 설명이
                눈에 안 들어온다. 각 문장은 폭이 좁으면 그 안에서 다시 접힌다. */}
            <p className="text-teal-gray-400 font-suit flex flex-col text-base leading-[1.5] font-light tracking-[-0.48px] md:text-lg md:font-normal md:tracking-[-0.36px]">
              {active.descriptionLines.map((line) => (
                <span key={line}>{line}</span>
              ))}
            </p>
          </div>
        </div>

        {/* 모바일 전용 전환 막대. 768 부터는 좌측 탭이 같은 일을 한다. */}
        {/* 시안 캡처의 테두리는 흰 실선이 아니다. 안쪽 면과 재보면 R·G·B 가 같은
            양만큼(네 변 평균 0.075) 올라갈 뿐이라 흰색을 옅게 깐 것에 가깝다.
            border-white 를 그대로 쓰면 밝은 흰 선이 되어 시안보다 도드라진다. */}
        <div className="mt-6 flex items-center justify-center gap-2.5 rounded-[12px] border border-white/[0.08] bg-[rgba(251,252,252,0.05)] px-3 py-1.5 backdrop-blur-[21px] md:hidden">
          <button
            type="button"
            aria-label="이전 활동"
            disabled={index === 0}
            onClick={() => setIndex(clamp(index - 1))}
            className={cn(
              "flex size-7.5 items-center justify-center",
              index === 0
                ? "text-teal-gray-700"
                : "text-teal-gray-400 cursor-pointer",
            )}
          >
            <Chevron className="h-[17px] w-[9.5px] rotate-180" />
          </button>
          <div className="flex items-center gap-1.5">
            {ITEMS.map((item, i) => (
              <button
                key={item.id}
                type="button"
                aria-label={item.label}
                aria-current={i === index}
                onClick={() => setIndex(i)}
                className={cn(
                  "h-2 cursor-pointer rounded-[6px] transition-all",
                  i === index
                    ? "bg-teal-gray-400 w-4.5"
                    : "bg-teal-gray-700 w-2",
                )}
              />
            ))}
          </div>
          <button
            type="button"
            aria-label="다음 활동"
            disabled={index === last}
            onClick={() => setIndex(clamp(index + 1))}
            className={cn(
              "flex size-7.5 items-center justify-center",
              index === last
                ? "text-teal-gray-700"
                : "text-teal-gray-400 cursor-pointer",
            )}
          >
            <Chevron className="h-[17px] w-[9.5px]" />
          </button>
        </div>
      </div>
    </section>
  )
}
