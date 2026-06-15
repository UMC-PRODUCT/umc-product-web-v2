import { motion } from "motion/react"
import { useEffect } from "react"

import { LANDING_BACKGROUND, LANDING_BACKGROUND_HEIGHT } from "../constants"
import { LandingHeader } from "./components/LandingHeader"
import { LightStripTexture } from "./components/LightStripTexture"
import { HeroSection } from "./sections/HeroSection"
import { MakerChallengerFaqSection } from "./sections/MakerChallengerFaqSection"
import { MatchingSection } from "./sections/MatchingSection"
import { PainpointSection } from "./sections/PainpointSection"
import { PlanChallengerFaqSection } from "./sections/PlanChallengerFaqSection"
import { ProductTeamAboutSection } from "./sections/ProductTeamAboutSection"
import { ProductTeamIntroSection } from "./sections/ProductTeamIntroSection"
import { ProductTeamMembersSection } from "./sections/ProductTeamMembersSection"
import { SolutionSection } from "./sections/SolutionSection"

export function IntroPage() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return
    }

    let timer: ReturnType<typeof setTimeout> | undefined
    let snapping = false
    const defaultSnapRange = Math.min(window.innerHeight * 0.35, 320)
    const strongSnapRange = Math.min(window.innerHeight * 0.58, 520)

    const getSnapPoints = () =>
      Array.from(document.querySelectorAll<HTMLElement>("[data-snap-point]"))
        .map((el) => ({
          top: el.getBoundingClientRect().top + window.scrollY,
          range:
            el.dataset.snapStrength === "strong"
              ? strongSnapRange
              : defaultSnapRange,
        }))
        .sort((a, b) => a.top - b.top)

    const handleScroll = () => {
      if (snapping) return
      clearTimeout(timer)
      timer = setTimeout(() => {
        const points = getSnapPoints()
        if (points.length === 0) return
        const y = window.scrollY
        let nearest = points[0]
        if (nearest === undefined) return
        for (const point of points) {
          if (Math.abs(point.top - y) < Math.abs(nearest.top - y)) {
            nearest = point
          }
        }
        if (Math.abs(nearest.top - y) > nearest.range) return
        if (Math.abs(nearest.top - y) > 2) {
          snapping = true
          window.scrollTo({ top: nearest.top, behavior: "smooth" })
          setTimeout(() => {
            snapping = false
          }, 600)
        }
      }, 80)
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => {
      window.removeEventListener("scroll", handleScroll)
      clearTimeout(timer)
    }
  }, [])

  return (
    <main className="flex w-full justify-center bg-black">
      <LandingHeader />
      <div className="relative w-[1440px]">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div
            className="absolute inset-x-0 top-0"
            style={{
              height: LANDING_BACKGROUND_HEIGHT,
              backgroundImage: LANDING_BACKGROUND,
            }}
            aria-hidden="true"
          />
        </div>
        <div className="relative z-10">
          <HeroSection />
          <PainpointSection />
          <SolutionSection />
          <MatchingSection />
          <PlanChallengerFaqSection />
          <MakerChallengerFaqSection />
          <div
            className="relative w-[1440px] overflow-hidden bg-[#def4ef]"
            style={{
              backgroundImage: [
                "linear-gradient(135.17deg, rgba(46,209,190,0.16) 8.35%, rgba(46,209,190,0) 48.63%)",
                "linear-gradient(-35.68deg, rgba(152,235,235,0.2) 12.21%, rgba(10,252,252,0) 35.65%)",
              ].join(", "),
              backgroundSize: "100% 2430px",
              backgroundPosition: "0 0",
              backgroundRepeat: "no-repeat",
            }}
          >
            <motion.div
              className="pointer-events-none absolute top-[428px] left-[880px] size-[764px] rounded-full bg-[#5fd7cf]/30 blur-[150px]"
              animate={{ x: [0, 18, 0], y: [0, -14, 0] }}
              transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
              className="pointer-events-none absolute top-[1117px] left-[720px] size-[764px] rounded-full bg-[#5fd7cf]/30 blur-[150px]"
              animate={{ x: [0, -16, 0], y: [0, 18, 0] }}
              transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
              className="pointer-events-none absolute top-[2048px] left-[880px] size-[764px] rounded-full bg-[#5fd7cf]/30 blur-[150px]"
              animate={{ x: [0, 14, 0], y: [0, 16, 0] }}
              transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
              className="pointer-events-none absolute top-[1322px] left-[-79px] size-[676px]"
              animate={{ x: [0, 12, 0], y: [0, -10, 0] }}
              transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
              style={{
                backgroundImage:
                  "radial-gradient(circle, rgba(255,255,255,0.52) 0%, rgba(255,255,255,0) 50%)",
              }}
            />
            <motion.div
              className="pointer-events-none absolute top-0 right-0"
              animate={{ x: [0, -10, 0], opacity: [0.85, 1, 0.85] }}
              transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
            >
              <LightStripTexture />
            </motion.div>
            <motion.div
              className="pointer-events-none absolute top-0 left-[101px]"
              animate={{ x: [0, 10, 0], opacity: [0.75, 1, 0.75] }}
              transition={{ duration: 13, repeat: Infinity, ease: "easeInOut" }}
            >
              <div className="flex">
                <LightStripTexture />
                <LightStripTexture className="ml-[736px]" />
              </div>
            </motion.div>
            <ProductTeamIntroSection />
            <ProductTeamAboutSection />
            <ProductTeamMembersSection />
          </div>
        </div>
      </div>
    </main>
  )
}
