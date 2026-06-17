import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useScroll,
} from "motion/react"
import { useRef, useState } from "react"

import { GLOW_ELLIPSE_SRC, MATCHING_LABEL } from "../../constants"
import { GlowImage } from "../components/GlowImage"
import { MatchingFlowPage } from "../components/MatchingFlowPage"
import { MatchingSchedulePage } from "../components/MatchingSchedulePage"
import { MANUAL_PAGE_COUNT, ManualGuideFrame } from "./ManualGuide"

const MATCHING_PAGE_COUNT = 2
const TOTAL_PAGE_COUNT = MATCHING_PAGE_COUNT + MANUAL_PAGE_COUNT
const PAGE_SCROLL_HEIGHT = 900
const SECTION_HEIGHT = PAGE_SCROLL_HEIGHT * TOTAL_PAGE_COUNT
const PAGE_SCROLL_DURATION = 500

function smoothScrollTo(targetY: number, duration: number, onDone: () => void) {
  const startY = window.scrollY
  const distance = targetY - startY
  if (Math.abs(distance) < 1) {
    onDone()
    return () => {}
  }

  const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3)
  let startTime: number | null = null
  let rafId = 0
  let cancelled = false

  const step = (now: number) => {
    if (cancelled) return
    if (startTime === null) startTime = now
    const progress = Math.min(1, (now - startTime) / duration)
    window.scrollTo(window.scrollX, startY + distance * easeOutCubic(progress))
    if (progress < 1) {
      rafId = requestAnimationFrame(step)
    } else {
      onDone()
    }
  }

  rafId = requestAnimationFrame(step)
  return () => {
    cancelled = true
    cancelAnimationFrame(rafId)
  }
}

export function MatchingSection() {
  const ref = useRef<HTMLElement>(null)
  const directionRef = useRef(1)
  const isProgrammaticRef = useRef(false)
  const cancelScrollRef = useRef<(() => void) | null>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  })
  const [page, setPage] = useState(0)
  useMotionValueEvent(scrollYProgress, "change", (value) => {
    if (isProgrammaticRef.current) return
    const nextPage = Math.min(
      TOTAL_PAGE_COUNT - 1,
      Math.floor(value * TOTAL_PAGE_COUNT),
    )
    directionRef.current = nextPage > page ? 1 : -1
    setPage(nextPage)
  })

  function moveToPage(index: number) {
    const section = ref.current
    if (!section) {
      setPage(index)
      return
    }

    const sectionTop = section.getBoundingClientRect().top + window.scrollY
    const scrollableHeight = section.offsetHeight - window.innerHeight
    const targetY =
      sectionTop + (scrollableHeight * index) / (TOTAL_PAGE_COUNT - 1)

    setPage(index)
    cancelScrollRef.current?.()
    isProgrammaticRef.current = true
    cancelScrollRef.current = smoothScrollTo(
      targetY,
      PAGE_SCROLL_DURATION,
      () => {
        isProgrammaticRef.current = false
      },
    )
  }

  function handleManualPrev() {
    directionRef.current = -1
    moveToPage(Math.max(MATCHING_PAGE_COUNT, page - 1))
  }

  function handleManualNext() {
    directionRef.current = 1
    moveToPage(Math.min(TOTAL_PAGE_COUNT - 1, page + 1))
  }

  function handleManualDotClick(index: number) {
    const nextPage = MATCHING_PAGE_COUNT + index
    directionRef.current = nextPage > page ? 1 : -1
    moveToPage(nextPage)
  }

  return (
    <section
      ref={ref}
      className="relative w-[1440px]"
      style={{ height: SECTION_HEIGHT }}
    >
      <AnimatePresence initial={false}>
        {page < MATCHING_PAGE_COUNT ? (
          <motion.div
            key="matching"
            className="sticky top-0 h-[900px] w-[1440px] overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <GlowImage
              src={GLOW_ELLIPSE_SRC}
              left={391}
              top={145}
              width={659}
              height={611}
              inset="-56.73% -52.6%"
            />

            <p className="absolute top-[112px] left-1/2 z-10 -translate-x-1/2 text-[18px] leading-[1.4] font-semibold tracking-[-0.18px] text-[#0e8179]">
              {MATCHING_LABEL}
            </p>

            <div className="absolute top-[169px] left-1/2 z-10 -translate-x-1/2">
              <AnimatePresence mode="wait">
                {page === 0 ? (
                  <motion.div
                    key="flow"
                    initial={{
                      opacity: 0,
                      y: directionRef.current > 0 ? 12 : -12,
                    }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{
                      opacity: 0,
                      y: directionRef.current > 0 ? -12 : 12,
                    }}
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <MatchingFlowPage />
                  </motion.div>
                ) : (
                  <motion.div
                    key="schedule"
                    initial={{
                      opacity: 0,
                      y: directionRef.current > 0 ? 12 : -12,
                    }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{
                      opacity: 0,
                      y: directionRef.current > 0 ? -12 : 12,
                    }}
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <MatchingSchedulePage />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="manual"
            className="sticky top-0 h-[900px] w-[1440px] overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <ManualGuideFrame
              inheritBackground
              pinned={false}
              page={page - MATCHING_PAGE_COUNT}
              direction={directionRef.current}
              onPrev={handleManualPrev}
              onNext={handleManualNext}
              onDotClick={handleManualDotClick}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
