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

const LIGHT_OVERLAY_FADE = 120
const LIGHT_OVERLAY_MASK = `linear-gradient(to right, transparent, #000 ${LIGHT_OVERLAY_FADE}px, #000 calc(100% - ${LIGHT_OVERLAY_FADE}px), transparent)`

function StaticGlow({
  left,
  top,
  size,
  opacity = 0.3,
}: {
  left: number
  top: number
  size: number
  opacity?: number
}) {
  return (
    <div
      className="pointer-events-none absolute rounded-full"
      style={{
        left,
        top,
        width: size,
        height: size,
        opacity,
        background:
          "radial-gradient(circle, rgba(95,215,207,0.42) 0%, rgba(95,215,207,0.22) 34%, rgba(95,215,207,0.08) 58%, rgba(95,215,207,0) 78%)",
      }}
      aria-hidden="true"
    />
  )
}

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
          <div className="relative w-[1440px] overflow-hidden bg-[#def4ef]">
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                backgroundImage: [
                  "linear-gradient(135.17deg, rgba(46,209,190,0.16) 8.35%, rgba(46,209,190,0) 48.63%)",
                  "linear-gradient(-35.68deg, rgba(152,235,235,0.2) 12.21%, rgba(10,252,252,0) 35.65%)",
                ].join(", "),
                backgroundSize: "100% 2430px",
                backgroundPosition: "0 0",
                backgroundRepeat: "no-repeat",
                maskImage: LIGHT_OVERLAY_MASK,
                WebkitMaskImage: LIGHT_OVERLAY_MASK,
              }}
              aria-hidden="true"
            >
              <StaticGlow left={760} top={308} size={1004} opacity={0.34} />
              <StaticGlow left={600} top={997} size={1004} opacity={0.32} />
              <StaticGlow left={760} top={1928} size={1004} opacity={0.3} />
              <div
                className="pointer-events-none absolute top-[1322px] left-[-79px] size-[676px]"
                style={{
                  backgroundImage:
                    "radial-gradient(circle, rgba(255,255,255,0.52) 0%, rgba(255,255,255,0) 50%)",
                }}
              />
              <div className="pointer-events-none absolute top-0 right-0 opacity-90">
                <LightStripTexture />
              </div>
              <div className="pointer-events-none absolute top-0 left-[101px] opacity-80">
                <div className="flex">
                  <LightStripTexture />
                  <LightStripTexture className="ml-[736px]" />
                </div>
              </div>
            </div>
            <ProductTeamIntroSection />
            <ProductTeamAboutSection />
            <ProductTeamMembersSection />
          </div>
        </div>
      </div>
    </main>
  )
}
