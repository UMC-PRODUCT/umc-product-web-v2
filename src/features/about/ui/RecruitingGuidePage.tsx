import {
  RECRUITING_GUIDE_PARTS_CTA,
  RECRUITING_GUIDE_SCHOOLS,
} from "../recruitingGuideConstants"
import { RecruitingGuideFaqSection } from "./sections/RecruitingGuideFaqSection"
import { RecruitingGuideHeroSection } from "./sections/RecruitingGuideHeroSection"
import { RecruitingGuideScheduleSection } from "./sections/RecruitingGuideScheduleSection"
import { RecruitPartsSection } from "./sections/RecruitPartsSection"
import { SchoolsSection } from "./sections/SchoolsSection"

// 소개 랜딩과 같은 배경을 쓴다. 두 화면이 이어진 한 벌로 보여야 한다.
const LEFT_GLOW =
  "linear-gradient(97.82deg, rgba(46, 209, 190, 0.189) 0%, rgba(46, 209, 190, 0) 48.3%)"

const RIGHT_GLOW =
  "linear-gradient(95.65deg, rgba(46, 209, 190, 0) 63.6%, rgba(46, 209, 190, 0.269) 100%)"

export function RecruitingGuidePage() {
  return (
    <div
      className="relative min-h-screen overflow-hidden bg-black"
      style={{ backgroundImage: `${RIGHT_GLOW}, ${LEFT_GLOW}` }}
    >
      <div className="relative mx-auto w-full max-w-[1440px] px-8 xl:px-30">
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
