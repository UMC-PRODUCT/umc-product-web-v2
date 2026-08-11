import { LandingArtifact, LandingBackground } from "./LandingBackground"
import { ClosingSection } from "./sections/ClosingSection"
import { HeroSection } from "./sections/HeroSection"
import { IntroSection } from "./sections/IntroSection"
import { PossibilitySection } from "./sections/PossibilitySection"
import { PreviewSection } from "./sections/PreviewSection"
import { RecruitPartsSection } from "./sections/RecruitPartsSection"
import { SchoolsSection } from "./sections/SchoolsSection"
import { SponsorsSection } from "./sections/SponsorsSection"

export function AboutPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-black">
      <LandingBackground />
      <LandingArtifact />
      <div className="relative z-10 w-full px-8 xl:px-30">
        <HeroSection />
        <IntroSection />
        <PossibilitySection />
        <PreviewSection />
        <RecruitPartsSection />
        <SchoolsSection />
        <SponsorsSection />
        <ClosingSection />
      </div>
    </div>
  )
}
