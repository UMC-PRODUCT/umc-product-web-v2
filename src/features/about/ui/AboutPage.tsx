import { LandingBackground } from "./LandingBackground"
import { ClosingSection } from "./sections/ClosingSection"
import { HeroSection } from "./sections/HeroSection"
import { IntroSection } from "./sections/IntroSection"
import { PossibilitySection } from "./sections/PossibilitySection"
import { RecruitPartsSection } from "./sections/RecruitPartsSection"
import { SchoolsSection } from "./sections/SchoolsSection"

// 앱 전체는 밝은 배경(__root 의 bg-teal-gray-50)인데 이 페이지만 다크다.
// 라우트 안에서 자체 배경을 깐다.
//
// 시안 배경은 두 겹이다. 아래는 페이지 전체에 깔린 청록 글로우 두 덩어리(1440
// 프레임 fill), 위는 첫 섹션을 가로지르는 BG Grapic 이다.
//
// 글로우는 시안 원본 해상도 렌더에서 콘텐츠 없는 구간의 픽셀을 뽑아 최소제곱으로
// 맞췄다. 둘 다 x·y 에 대해 선형이라 linear-gradient 로 정확히 떨어진다.
const LEFT_GLOW =
  "linear-gradient(97.82deg, rgba(46, 209, 190, 0.189) 0%, rgba(46, 209, 190, 0) 48.3%)"

const RIGHT_GLOW =
  "linear-gradient(95.65deg, rgba(46, 209, 190, 0) 63.6%, rgba(46, 209, 190, 0.269) 100%)"

export function AboutPage() {
  return (
    <div
      className="relative min-h-screen overflow-hidden bg-black"
      style={{ backgroundImage: `${RIGHT_GLOW}, ${LEFT_GLOW}` }}
    >
      <LandingBackground />
      <div className="relative z-10 mx-auto w-full max-w-[1440px] px-8 xl:px-30">
        <HeroSection />
        <IntroSection />
        <PossibilitySection />
        <RecruitPartsSection />
        <SchoolsSection />
        <ClosingSection />
      </div>
    </div>
  )
}
