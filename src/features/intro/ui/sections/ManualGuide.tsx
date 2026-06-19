import { AnimatePresence, motion } from "motion/react"

import { cn } from "@/shared/lib/utils"

import { GLOW_ELLIPSE_SRC } from "../../constants"
import { GlowImage } from "../components/GlowImage"
import { ManualContent01 } from "../components/ManualContent01"
import { ManualContent02 } from "../components/ManualContent02"
import { ManualContent03 } from "../components/ManualContent03"
import { ManualContent04 } from "../components/ManualContent04"
import { ManualContent05 } from "../components/ManualContent05"
import { ManualContent06 } from "../components/ManualContent06"
import { ManualContent07 } from "../components/ManualContent07"
import { ManualContent08 } from "../components/ManualContent08"
import { ManualContent09 } from "../components/ManualContent09"

const CARD_BG = [
  "linear-gradient(134.38deg, rgba(46,209,190,0.16) 8.35%, rgba(46,209,190,0) 48.63%)",
  "linear-gradient(-54.78deg, rgba(46,209,190,0.4) 16.53%, rgba(46,209,190,0) 37.28%)",
].join(", ")

const TOTAL_DOTS = 9
export const MANUAL_PAGE_COUNT = 9

const slideVariants = {
  enter: (dir: number) => ({ opacity: 0, x: dir > 0 ? 48 : -48 }),
  center: { opacity: 1, x: 0 },
  exit: (dir: number) => ({ opacity: 0, x: dir > 0 ? -48 : 48 }),
}

interface PaginationBarProps {
  activeDot: number
  onPrev: () => void
  onNext: () => void
  onDotClick: (index: number) => void
}

function PaginationBar({
  activeDot,
  onPrev,
  onNext,
  onDotClick,
}: PaginationBarProps) {
  return (
    <div className="absolute top-[852px] left-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center gap-[10px] rounded-[12px] border border-white/10 bg-[rgba(21,36,34,0.72)] px-[12px] py-[6px]">
      <button
        onClick={onPrev}
        disabled={activeDot === 0}
        className="flex size-[30px] items-center justify-center transition-opacity disabled:cursor-not-allowed disabled:opacity-30"
        aria-label="이전"
      >
        <svg width="9" height="16" viewBox="0 0 9 16" fill="none">
          <path
            d="M8 1L1 8L8 15"
            stroke="#9ca3a3"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      <div className="flex items-center gap-[6px]">
        {Array.from({ length: TOTAL_DOTS }).map((_, i) =>
          i === activeDot ? (
            <div
              key={i}
              className="h-[8px] w-[18px] rounded-[6px] bg-[#9ca3a3]"
            />
          ) : (
            <button
              key={i}
              onClick={() => onDotClick(i)}
              className="size-[8px] rounded-full bg-[rgba(156,163,163,0.5)] transition-colors hover:bg-[rgba(156,163,163,0.8)]"
              aria-label={`${i + 1}번 슬라이드`}
            />
          ),
        )}
      </div>
      <button
        onClick={onNext}
        disabled={activeDot >= MANUAL_PAGE_COUNT - 1}
        className="relative flex size-[30px] items-center justify-center transition-opacity disabled:cursor-not-allowed disabled:opacity-30"
        aria-label="다음"
      >
        {activeDot === 0 && (
          <motion.span
            className="pointer-events-none absolute inset-[-22px] rounded-full border border-[#36d3c0]/35 bg-[#36d3c0]/10"
            initial={{ opacity: 0, scale: 0.72 }}
            animate={{ opacity: [0, 0.75, 0], scale: [0.72, 1, 1.35] }}
            transition={{
              duration: 1.4,
              ease: "easeOut",
              repeat: Infinity,
              repeatDelay: 0.25,
            }}
            aria-hidden="true"
          />
        )}
        <svg width="9" height="16" viewBox="0 0 9 16" fill="none">
          <path
            d="M1 1L8 8L1 15"
            stroke="#9ca3a3"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </div>
  )
}

function GuideBreadcrumb() {
  return (
    <div className="absolute top-[44px] left-[80px] flex -translate-y-1/2 items-center gap-[10.5px] opacity-90">
      <span className="text-[15.123px] leading-[18px] font-semibold text-[#9be9e0]">
        Guide
      </span>
      <div className="h-[12px] w-px bg-[#9be9e0] opacity-50" />
      <span className="text-[15.123px] leading-[18px] font-semibold text-[#36d3c0]">
        사용 메뉴얼
      </span>
    </div>
  )
}

interface ManualGuideFrameProps {
  page: number
  direction: number
  onPrev: () => void
  onNext: () => void
  onDotClick: (index: number) => void
  inheritBackground?: boolean
  pinned?: boolean
}

export function ManualGuideFrame({
  page,
  direction,
  onPrev,
  onNext,
  onDotClick,
  inheritBackground = false,
  pinned = true,
}: ManualGuideFrameProps) {
  return (
    <div
      className={cn(
        pinned && "sticky top-0",
        "h-[900px] w-[1440px] overflow-hidden",
        !inheritBackground && "bg-black",
      )}
    >
      <GlowImage
        src={GLOW_ELLIPSE_SRC}
        left={391}
        top={145}
        width={659}
        height={611}
        inset="-56.73% -52.6%"
        opacity={1 / 3}
      />

      <div
        className="absolute top-[calc(50%-8px)] left-1/2 h-[740px] w-[1280px] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-[16px] p-[40px]"
        style={{ backgroundImage: CARD_BG }}
      >
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={page}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            {page === 0 && <ManualContent01 />}
            {page === 1 && <ManualContent02 />}
            {page === 2 && <ManualContent03 />}
            {page === 3 && <ManualContent04 />}
            {page === 4 && <ManualContent05 />}
            {page === 5 && <ManualContent06 />}
            {page === 6 && <ManualContent07 />}
            {page === 7 && <ManualContent08 />}
            {page === 8 && <ManualContent09 />}
          </motion.div>
        </AnimatePresence>
      </div>

      <PaginationBar
        activeDot={page}
        onPrev={onPrev}
        onNext={onNext}
        onDotClick={onDotClick}
      />
      <GuideBreadcrumb />
    </div>
  )
}
