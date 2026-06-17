import { motion } from "motion/react"

import { LANDING_BACKGROUND, LANDING_BACKGROUND_HEIGHT } from "../constants"
import { LandingHeader } from "./components/LandingHeader"
import { LightStripTexture } from "./components/LightStripTexture"
import { SmoothGlow } from "./components/SmoothGlow"
import { HeroSection } from "./sections/HeroSection"
import { MakerChallengerFaqSection } from "./sections/MakerChallengerFaqSection"
import { MatchingSection } from "./sections/MatchingSection"
import { PainpointSection } from "./sections/PainpointSection"
import { PlanChallengerFaqSection } from "./sections/PlanChallengerFaqSection"
import { ProductTeamAboutSection } from "./sections/ProductTeamAboutSection"
import { ProductTeamIntroSection } from "./sections/ProductTeamIntroSection"
import { ProductTeamMembersSection } from "./sections/ProductTeamMembersSection"
import { SolutionSection } from "./sections/SolutionSection"

const LANDING_BACKGROUND_FADE_LEFT = 40
const LANDING_BACKGROUND_FADE_RIGHT = 120
const LANDING_BACKGROUND_MASK = `linear-gradient(to right, transparent, #000 ${LANDING_BACKGROUND_FADE_LEFT}px, #000 calc(100% - ${LANDING_BACKGROUND_FADE_RIGHT}px), transparent)`

export function IntroPage() {
  return (
    <main
      className="flex w-full justify-center"
      style={{
        background: `linear-gradient(to bottom, #000 ${LANDING_BACKGROUND_HEIGHT}px, #def4ef ${LANDING_BACKGROUND_HEIGHT}px)`,
        overflowX: "clip",
      }}
    >
      <LandingHeader />
      <div className="relative w-[1440px]">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div
            className="absolute inset-x-0 top-0"
            style={{
              height: LANDING_BACKGROUND_HEIGHT,
              backgroundImage: LANDING_BACKGROUND,
              maskImage: LANDING_BACKGROUND_MASK,
              WebkitMaskImage: LANDING_BACKGROUND_MASK,
            }}
            aria-hidden="true"
          />
          <SmoothGlow
            left={52}
            top={820}
            width={1336}
            height={1040}
            opacity={0.42}
          />
          <SmoothGlow
            left={340}
            top={1045}
            width={760}
            height={560}
            opacity={0.36}
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
