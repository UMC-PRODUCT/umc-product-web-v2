import bgGraphic from "@/shared/assets/image/about/bg-graphic.svg"

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
      {/* 시안에서 이미 1440x1416 으로 잘려 나온 에셋이라 페이지 좌표에 그대로
          얹는다.
          시안은 화면 폭이 달라져도 이 그래픽의 크기·위치를 바꾸지 않는다. 390
          프레임과 1440 프레임의 배치가 같고, 좁은 쪽은 왼쪽부터 잘라 보여 준다.
          390 시안과 아크 밝기를 맞춰 보면 177 대 179, 235 대 235 로 겹친다.
          그래서 1440 아래에서는 늘이지 않고 왼쪽에 붙인 채 잘라 낸다.
          1440 위로는 대응 시안이 없고 잘린 에셋이라 오른쪽이 비므로 화면을 따라
          늘인다. */}
      <img
        src={bgGraphic}
        alt=""
        aria-hidden
        className="pointer-events-none absolute top-0 left-0 h-354 w-full min-w-[1440px] object-fill"
      />
      <div className="relative mx-auto w-300">
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
