import {
  RECRUITING_GUIDE_PARTS_CTA,
  RECRUITING_GUIDE_SCHOOLS,
} from "../recruitingGuideConstants"
import { LandingArtifact, LandingBackground } from "./LandingBackground"
import { RecruitingGuideFaqSection } from "./sections/RecruitingGuideFaqSection"
import { RecruitingGuideHeroSection } from "./sections/RecruitingGuideHeroSection"
import { RecruitingGuideScheduleSection } from "./sections/RecruitingGuideScheduleSection"
import { RecruitPartsSection } from "./sections/RecruitPartsSection"
import { SchoolsSection } from "./sections/SchoolsSection"

export function RecruitingGuidePage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-black">
      <LandingBackground />
      <LandingArtifact />
      <div className="relative z-10 w-full px-8 xl:px-30">
        <RecruitingGuideHeroSection />
        <RecruitPartsSection
          ctaLabel={RECRUITING_GUIDE_PARTS_CTA.label}
          ctaTo={RECRUITING_GUIDE_PARTS_CTA.to}
        />
        <RecruitingGuideScheduleSection />
        {/* 지원할 학교를 찾는 자리라 학교줄을 멈춰 세운다. 시안에도 CTA 가 없다. */}
        <SchoolsSection
          variant="static"
          headline={RECRUITING_GUIDE_SCHOOLS.headline}
          descriptionLines={RECRUITING_GUIDE_SCHOOLS.descriptionLines}
          cta={null}
        />
        <RecruitingGuideFaqSection />
      </div>
    </div>
  )
}
